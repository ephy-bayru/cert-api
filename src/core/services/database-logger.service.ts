import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerOptions, LogLevel } from 'typeorm';

@Injectable()
export class DatabaseLoggerService {
  private readonly validOptions: LogLevel[] = [
    'query',
    'error',
    'schema',
    'warn',
    'info',
    'log',
    'migration',
  ];

  constructor(private configService: ConfigService) {}

  public determineDatabaseLoggingOptions(): LoggerOptions {
    const loggingConfig = this.configService.get<string>('DB_LOGGING');

    if (!loggingConfig || loggingConfig === 'false') {
      return false;
    } else if (loggingConfig === 'true' || loggingConfig === 'all') {
      return 'all';
    } else {
      const options = loggingConfig.split(',');
      const filteredOptions = options.filter((opt): opt is LogLevel =>
        this.validOptions.includes(opt as LogLevel),
      );

      return filteredOptions.length > 0 ? filteredOptions : false;
    }
  }
}
