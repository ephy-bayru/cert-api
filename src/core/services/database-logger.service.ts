import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/services/logger.service';
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

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {}

  public determineDatabaseLoggingOptions(): LoggerOptions {
    let loggingConfig =
      this.configService.get<string>('DB_LOGGING', 'false') ?? 'false';

    if (typeof loggingConfig !== 'string') {
      this.logger.logWarn('DB_LOGGING must be a string. Logging is disabled.');
      return false;
    }

    loggingConfig = loggingConfig.toLowerCase();

    if (loggingConfig === 'false') {
      return false;
    }

    if (['true', 'all'].includes(loggingConfig)) {
      return 'all';
    }

    const options = loggingConfig.split(',').map((opt) => opt.trim());

    const filteredOptions = options.filter((opt): opt is LogLevel =>
      this.validOptions.includes(opt as LogLevel),
    );

    if (filteredOptions.length === 0) {
      this.logger.logWarn(
        `Invalid DB_LOGGING options provided: ${loggingConfig}. Logging is disabled.`,
      );
      return false;
    }

    return filteredOptions;
  }
}
