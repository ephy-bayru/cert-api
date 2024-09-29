import { Injectable, ConsoleLogger, Scope } from '@nestjs/common';
import { serialize } from '../utils/serialization-utils';
import { ConfigService } from '@nestjs/config';

enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Log = 'log',
  Debug = 'debug',
  Verbose = 'verbose',
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService<T = any> extends ConsoleLogger {
  private readonly logLevelPriority: Record<LogLevel, number> = {
    [LogLevel.Error]: 0,
    [LogLevel.Warn]: 1,
    [LogLevel.Log]: 2,
    [LogLevel.Debug]: 3,
    [LogLevel.Verbose]: 4,
  };

  private currentLogLevel: LogLevel;

  constructor(
    private configService: ConfigService,
    context: string = 'ApplicationLogger',
  ) {
    super(context);
    this.currentLogLevel = this.determineLogLevel();
    this.log(`Logger initialized at level: ${this.currentLogLevel}`);
  }

  private determineLogLevel(): LogLevel {
    const level = this.configService
      .get<string>('LOG_LEVEL', LogLevel.Log)
      .toLowerCase();
    return (
      Object.values(LogLevel).includes(level as LogLevel) ? level : LogLevel.Log
    ) as LogLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return (
      this.logLevelPriority[level] <=
      this.logLevelPriority[this.currentLogLevel]
    );
  }

  private formatLogMessage(
    level: LogLevel,
    message: string,
    data?: Partial<T>,
  ): string {
    const timestamp = new Date().toISOString();
    const serializedData = data ? ` - Data: ${serialize(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${serializedData}`;
  }

  private logMessage(
    level: LogLevel,
    message: string,
    data?: Partial<T>,
    trace?: string,
  ) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatLogMessage(level, message, data);
      switch (level) {
        case LogLevel.Error:
          super.error(formattedMessage, trace);
          break;
        case LogLevel.Warn:
          super.warn(formattedMessage);
          break;
        case LogLevel.Debug:
          super.debug(formattedMessage);
          break;
        case LogLevel.Verbose:
          super.verbose(formattedMessage);
          break;
        default:
          super.log(formattedMessage);
          break;
      }
    }
  }

  public logInfo(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Log, message, data);
  }

  public logWarn(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Warn, message, data);
  }

  public logError(message: string, data?: Partial<T>, trace?: string) {
    this.logMessage(LogLevel.Error, message, data, trace);
  }

  public logDebug(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Debug, message, data);
  }

  public logVerbose(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Verbose, message, data);
  }
}
