import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseLoggerService } from 'src/core/services/database-logger.service';
import { LoggerService } from 'src/common/services/logger.service';
import * as path from 'path';

const REQUIRED_CONFIG_KEYS: Record<string, string> = {
  DB_HOST: 'string',
  DB_USERNAME: 'string',
  DB_PASSWORD: 'string',
  DB_NAME: 'string',
};

const validateConfig = (
  configService: ConfigService,
  logger: LoggerService,
) => {
  for (const [key, type] of Object.entries(REQUIRED_CONFIG_KEYS)) {
    const value = configService.get<string>(key);
    if (!value) {
      logger.error(
        `Database configuration error: ${key} is missing`,
        'TypeOrmConfig',
        { configKey: key },
      );
      throw new Error(`Database configuration error: ${key} is missing`);
    }
    if (typeof value !== type) {
      logger.error(
        `Database configuration error: ${key} should be of type ${type}`,
        'TypeOrmConfig',
        { configKey: key, expectedType: type, actualType: typeof value },
      );
      throw new Error(
        `Database configuration error: ${key} should be of type ${type}`,
      );
    }
  }
};

export const typeormConfig = (
  configService: ConfigService,
  databaseLoggerService: DatabaseLoggerService,
  logger: LoggerService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const sslEnabled = configService.get<boolean>('DB_SSL', false);
  const sslOptions = sslEnabled ? { rejectUnauthorized: false } : undefined;

  // Validate required configuration
  validateConfig(configService, logger);

  const dbHost = configService.get<string>('DB_HOST');

  logger.log(`Attempting to connect to database at ${dbHost}`, 'TypeOrmConfig');

  const entities = [
    path.join(__dirname, '..', 'modules', '**', 'entities', '*.{ts,js}'),
  ];
  const migrations = [path.join(__dirname, '..', 'migrations', '*.{ts,js}')];

  const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: dbHost,
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities,
    migrations,
    autoLoadEntities: true,
    synchronize: false,
    ssl: sslOptions,
    logger: databaseLoggerService,
    logging: false,
    retryAttempts: configService.get<number>('DB_RETRY_ATTEMPTS', 5),
    retryDelay: configService.get<number>('DB_RETRY_DELAY', 3000),
    maxQueryExecutionTime: configService.get<number>('DB_QUERY_TIMEOUT', 5000),
    poolSize: configService.get<number>('DB_POOL_SIZE', 10),
    extra: {
      max: configService.get<number>('DB_POOL_MAX', 20),
      connectionTimeoutMillis: configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        30000,
      ),
    },
  };

  // Log Configuration Details
  logger.log('TypeORM configuration initialized', 'TypeOrmConfig', {
    isProduction,
    sslEnabled,
    dbHost,
    entities,
    migrations,
  });

  // Log full configuration in development
  if (!isProduction) {
    const { password, ...safeConfig } = config;
    logger.debug('Detailed TypeORM configuration', 'TypeOrmConfig', {
      ...safeConfig,
      password: '[REDACTED]',
    });
  }

  return config;
};
