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
    private configService?: ConfigService,
    context: string = 'ApplicationLogger',
  ) {
    super(context);
    this.currentLogLevel = this.determineLogLevel();
    this.log(`Logger initialized at level: ${this.currentLogLevel}`);
  }

  /**
   * Determines the log level based on the configuration service or a default value.
   * @returns The log level to be used for logging.
   */
  private determineLogLevel(): LogLevel {
    const level =
      this.configService?.get<LogLevel>('LOG_LEVEL', LogLevel.Log) ??
      LogLevel.Log;
    return Object.values(LogLevel).includes(level) ? level : LogLevel.Log;
  }

  /**
   * Determines if a message should be logged based on the current log level.
   * @param level The log level of the current message.
   * @returns Whether the message should be logged.
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      this.logLevelPriority[level] <=
      this.logLevelPriority[this.currentLogLevel]
    );
  }

  /**
   * Formats a log message with additional data and the current context.
   * @param level The log level.
   * @param message The log message.
   * @param data Additional data to log.
   * @returns The formatted log message string.
   */
  private formatLogMessage(
    level: LogLevel,
    message: string,
    data?: Partial<T>,
  ): string {
    const timestamp = new Date().toISOString();
    const serializedData = data ? ` - Data: ${serialize(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${serializedData}`;
  }

  /**
   * Logs a message based on the log level and provided data.
   * @param level The log level.
   * @param message The log message.
   * @param data Additional data to log.
   * @param trace Optional stack trace for error logging.
   */
  private logMessage(
    level: LogLevel,
    message: string,
    data?: Partial<T>,
    trace?: string,
  ) {
    if (this.shouldLog(level)) {
      const formattedMessage = this.formatLogMessage(level, message, data);
      super[level](formattedMessage, trace);
    }
  }

  /**
   * Logs an informational message.
   * @param message The log message.
   * @param data Additional data to log.
   */
  public logInfo(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Log, message, data);
  }

  /**
   * Logs a warning message.
   * @param message The log message.
   * @param data Additional data to log.
   */
  public logWarn(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Warn, message, data);
  }

  /**
   * Logs an error message.
   * @param message The log message.
   * @param data Additional data to log.
   * @param trace Optional stack trace.
   */
  public logError(message: string, data?: Partial<T>, trace?: string) {
    this.logMessage(LogLevel.Error, message, data, trace);
  }

  /**
   * Logs a debug message.
   * @param message The log message.
   * @param data Additional data to log.
   */
  public logDebug(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Debug, message, data);
  }

  /**
   * Logs a verbose message.
   * @param message The log message.
   * @param data Additional data to log.
   */
  public logVerbose(message: string, data?: Partial<T>) {
    this.logMessage(LogLevel.Verbose, message, data);
  }
}
