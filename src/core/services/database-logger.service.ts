import { Injectable } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner, LogLevel } from 'typeorm';
import { LoggerService } from 'src/common/services/logger.service';

@Injectable()
export class DatabaseLoggerService implements TypeOrmLogger {
  private readonly validOptions: LogLevel[] = [
    'query',
    'error',
    'schema',
    'warn',
    'info',
    'log',
    'migration',
  ];

  constructor(private readonly logger: LoggerService) {}

  private isLogLevelEnabled(level: LogLevel): boolean {
    return this.validOptions.includes(level);
  }

  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner) {
    if (this.isLogLevelEnabled('query')) {
      this.logger.debug(`Query: ${query}`, 'TypeORM');
      if (parameters && parameters.length) {
        this.logger.debug(
          `Parameters: ${JSON.stringify(parameters)}`,
          'TypeORM',
        );
      }
    }
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    if (this.isLogLevelEnabled('error')) {
      this.logger.error(`Query Error: ${error}`, 'TypeORM', {
        query,
        parameters,
      });
    }
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ) {
    if (this.isLogLevelEnabled('warn')) {
      this.logger.warn(`Slow Query (${time} ms): ${query}`, 'TypeORM', {
        parameters,
      });
    }
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner) {
    if (this.isLogLevelEnabled('schema')) {
      this.logger.info(`Schema Build: ${message}`, 'TypeORM');
    }
  }

  logMigration(message: string, _queryRunner?: QueryRunner) {
    if (this.isLogLevelEnabled('migration')) {
      this.logger.info(`Migration: ${message}`, 'TypeORM');
    }
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ) {
    if (this.isLogLevelEnabled(level)) {
      switch (level) {
        case 'log':
          this.logger.log(message, 'TypeORM');
          break;
        case 'info':
          this.logger.info(message, 'TypeORM');
          break;
        case 'warn':
          this.logger.warn(message, 'TypeORM');
          break;
      }
    }
  }
}
