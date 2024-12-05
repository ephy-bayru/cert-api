import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseLoggerService } from 'src/core/services/database-logger.service';
import { LoggerService } from 'src/common/services/logger.service';
import * as path from 'path';

export const typeormConfig = (
  configService: ConfigService,
  databaseLoggerService: DatabaseLoggerService,
  logger: LoggerService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // SSL Configuration
  const sslEnabled = configService.get<boolean>('DB_SSL', false);
  const sslOptions = sslEnabled ? { rejectUnauthorized: false } : false;

  // Required Configuration Check
  const requiredConfig = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  for (const key of requiredConfig) {
    if (!configService.get<string>(key)) {
      logger.error(
        `Database configuration error: ${key} is missing`,
        'TypeOrmConfig',
        { configKey: key },
      );
      throw new Error(`Database configuration error: ${key} is missing`);
    }
  }

  // Database Logging Configuration
  const loggingOptions =
    databaseLoggerService.determineDatabaseLoggingOptions();

  const dbHost = configService.get<string>('DB_HOST');
  logger.log(`Attempting to connect to database at ${dbHost}`, 'TypeOrmConfig');

  // Use glob patterns to load entities
  const entities = [
    path.resolve(
      __dirname,
      '..',
      'modules',
      '**',
      'entities',
      '*.entity.{ts,js}',
    ),
  ];

  const migrations = [path.resolve(__dirname, '..', 'migrations', '*.{ts,js}')];

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
    logging: loggingOptions,
    retryAttempts: 5,
    retryDelay: 3000,
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
    loggingEnabled: !!loggingOptions,
    loggingOptions: loggingOptions === 'all' ? 'all' : loggingOptions,
    entities,
  });

  // Log full configuration in development
  if (!isProduction) {
    logger.debug('Detailed TypeORM configuration', 'TypeOrmConfig', {
      ...config,
      password: '[REDACTED]', // Hide sensitive info
      entities,
    });
  }

  return config;
};
