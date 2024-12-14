import {
  Injectable,
  LoggerService as NestLoggerService,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose';

const logLevels: LogLevel[] = ['error', 'warn', 'info', 'debug', 'verbose'];

interface LogEntry {
  timestamp: string;
  level: string;
  context: string;
  message: string;
  meta?: any;
}

interface LoggerOptions {
  logToFile?: boolean;
  logDir?: string;
  maxLogSize?: number;
  maxFiles?: number;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private currentLogLevel: LogLevel;
  private logStream: fs.WriteStream | null = null;
  private logFile: string | null = null;
  private logSize: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly options: LoggerOptions = {},
  ) {
    this.currentLogLevel = this.determineLogLevel();
    this.initializeFileLogging();
    this.info('LoggerService initialized', 'LoggerService', {
      level: this.currentLogLevel,
    });
  }

  private determineLogLevel(): LogLevel {
    return this.configService.get<LogLevel>('logger.level', 'info');
  }

  private shouldLog(level: LogLevel): boolean {
    return logLevels.indexOf(level) <= logLevels.indexOf(this.currentLogLevel);
  }

  private formatLogEntry(
    level: LogLevel,
    message: string,
    context: string = 'App',
    meta?: any,
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context,
      message,
      ...(meta && { meta }),
    };
  }

  private colorize(text: string, colorCode: number): string {
    return `\x1b[${colorCode}m${text}\x1b[0m`;
  }

  private maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    let maskedData: any;

    if (Array.isArray(data)) {
      maskedData = [];
      for (let i = 0; i < data.length; i++) {
        maskedData[i] = this.maskSensitiveData(data[i]);
      }
    } else {
      maskedData = {} as { [key: string]: any };
      for (const [key, value] of Object.entries(data)) {
        if (key.toLowerCase().includes('password')) {
          maskedData[key] = '*'.repeat(8);
        } else if (typeof value === 'object' && value !== null) {
          maskedData[key] = this.maskSensitiveData(value);
        } else {
          maskedData[key] = value;
        }
      }
    }

    return maskedData;
  }

  private logToConsole(logEntry: LogEntry): void {
    const timestamp = this.colorize(logEntry.timestamp, 90); // Dim gray for timestamp
    const level = this.getColoredLevel(logEntry.level);
    const context = this.colorize(`[${logEntry.context}]`, 36); // Cyan for context
    let message = this.colorize(logEntry.message, 92); // Light green for main message

    // Special handling for certain contexts
    if (logEntry.context === 'RouterExplorer') {
      message = this.colorize(logEntry.message, 93); // Light yellow
      message = '  ' + message; // Add indentation for route mappings
    } else if (['NestApplication', 'Bootstrap'].includes(logEntry.context)) {
      message = this.colorize(logEntry.message, 96); // Light cyan for important system messages
    }

    console.log(`${timestamp} ${level} ${context} ${message}`);
    if (logEntry.meta) {
      const maskedMeta = this.maskSensitiveData(logEntry.meta);
      console.log(this.colorize(JSON.stringify(maskedMeta, null, 2), 94)); // Light blue for JSON data
    }
  }

  private logToFile(logEntry: LogEntry): void {
    if (this.logStream) {
      const maskedEntry = {
        ...logEntry,
        meta: this.maskSensitiveData(logEntry.meta),
      };
      const logMessage = JSON.stringify(maskedEntry) + '\n';
      this.logStream.write(logMessage);
      this.logSize += Buffer.byteLength(logMessage);
      this.checkRotation();
    }
  }

  private getColoredLevel(level: string): string {
    const colors: { [key: string]: number } = {
      ERROR: 91, // Bright red
      WARN: 93, // Bright yellow
      INFO: 92, // Bright green
      DEBUG: 94, // Bright blue
      VERBOSE: 95, // Bright magenta
    };
    const colorCode = colors[level] || 97; // Default to bright white
    return this.colorize(`[${level}]`, colorCode);
  }

  private createLogMethod(level: LogLevel) {
    return (message: string, context?: string, meta?: any) => {
      if (this.shouldLog(level)) {
        const logEntry = this.formatLogEntry(level, message, context, meta);
        this.logToConsole(logEntry);
        this.logToFile(logEntry);
      }
    };
  }

  private initializeFileLogging(): void {
    if (this.options.logToFile) {
      const logDir = this.options.logDir || 'logs';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      this.logFile = path.join(
        logDir,
        `app-${new Date().toISOString().split('T')[0]}.log`,
      );
      this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
    }
  }

  private checkRotation(): void {
    if (this.options.maxLogSize && this.logSize >= this.options.maxLogSize) {
      this.rotateLog();
    }
  }

  private rotateLog(): void {
    if (this.logStream && this.logFile) {
      this.logStream.end();
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const newName = `${this.logFile}.${timestamp}`;
      fs.renameSync(this.logFile, newName);
      this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
      this.logSize = 0;
      this.cleanOldLogs();
    }
  }

  private cleanOldLogs(): void {
    const { maxFiles, logDir } = this.options;

    if (!maxFiles || !logDir) {
      return;
    }

    try {
      const files = fs
        .readdirSync(logDir)
        .filter((file) => file.startsWith('app-') && file.endsWith('.log'))
        .map((file) => ({
          name: file,
          path: path.join(logDir, file),
          mtime: fs.statSync(path.join(logDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.mtime - a.mtime);

      files.slice(maxFiles).forEach((file) => {
        try {
          fs.unlinkSync(file.path);
          this.info(`Deleted old log file: ${file.name}`, 'LoggerService');
        } catch (err) {
          this.error(
            `Failed to delete old log file: ${file.name}`,
            'LoggerService',
            err,
          );
        }
      });
    } catch (err) {
      this.error('Failed to clean old log files', 'LoggerService', err);
    }
  }

  error = this.createLogMethod('error');
  warn = this.createLogMethod('warn');
  log = this.createLogMethod('info');
  info = this.createLogMethod('info');
  debug = this.createLogMethod('debug');
  verbose = this.createLogMethod('verbose');

  setLogLevel(level: LogLevel): void {
    if (logLevels.includes(level)) {
      this.currentLogLevel = level;
      this.info(
        `Log level changed to: ${level.toUpperCase()}`,
        'LoggerService',
      );
    } else {
      this.warn(
        `Invalid log level: ${level}. Keeping current level: ${this.currentLogLevel}`,
        'LoggerService',
      );
    }
  }
}
