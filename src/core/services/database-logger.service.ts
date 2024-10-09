import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/services/logger.service';
import { LoggerOptions, LogLevel } from 'typeorm';

@Injectable()
export class DatabaseLoggerService {
  private readonly validOptions: readonly LogLevel[] = [
    'query',
    'error',
    'schema',
    'warn',
    'info',
    'log',
    'migration',
  ] as const;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {}

  public determineDatabaseLoggingOptions(): LoggerOptions {
    const loggingConfig = this.configService.get<string>('DB_LOGGING', 'false');

    if (typeof loggingConfig !== 'string') {
      this.logger.warn(
        'DB_LOGGING must be a string. Logging is disabled.',
        'DatabaseLoggerService',
      );
      return false;
    }

    const normalizedConfig = loggingConfig.toLowerCase();

    if (normalizedConfig === 'false') {
      return false;
    }

    if (['true', 'all'].includes(normalizedConfig)) {
      return 'all';
    }

    const options = normalizedConfig.split(',').map((opt) => opt.trim());
    const filteredOptions = options.filter((opt): opt is LogLevel =>
      this.validOptions.includes(opt as LogLevel),
    );

    if (filteredOptions.length === 0) {
      this.logger.warn(
        `Invalid DB_LOGGING options provided: ${loggingConfig}. Logging is disabled.`,
        'DatabaseLoggerService',
      );
      return false;
    }

    return filteredOptions;
  }
}
