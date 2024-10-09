import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { LoggerOptions } from 'typeorm';
import { DatabaseLoggerService } from 'src/core/services/database-logger.service';
import { LoggerService } from 'src/common/services/logger.service';

export const typeormConfig = (
  configService: ConfigService,
  databaseLoggerService: DatabaseLoggerService,
  logger: LoggerService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';

  // Determine whether SSL is required or not
  const sslEnabled = configService.get<boolean>('DB_SSL', false);
  const sslOptions = sslEnabled ? { rejectUnauthorized: false } : false;

  // Ensure mandatory configuration is present
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

  // Update entity and migration paths based on the environment
  const entities = isProduction
    ? [__dirname + '/../../**/*.entity{.js,.ts}']
    : [__dirname + '/../**/*.entity{.ts,.js}'];

  const migrations = isProduction
    ? [__dirname + '/../../migrations/*{.js,.ts}']
    : [__dirname + '/../migrations/*{.ts,.js}'];

  // Fetch logging level or options from environment or use custom logger service
  const loggingOptions: LoggerOptions | 'all' =
    databaseLoggerService.determineDatabaseLoggingOptions();

  const dbHost = configService.get<string>('DB_HOST');
  logger.log(`Attempting to connect to database at ${dbHost}`, 'TypeOrmConfig');

  logger.log('TypeORM configuration initialized', 'TypeOrmConfig', {
    isProduction,
    sslEnabled,
    entities,
    migrations,
    loggingOptions,
    dbHost,
  });

  return {
    type: 'postgres',
    host: dbHost,
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities,
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('TYPEORM_SYNC', !isProduction),
    migrationsRun: configService.get<boolean>('TYPEORM_MIGRATIONS_RUN', true),
    migrations,
    logging: loggingOptions,
    ssl: sslOptions,
    extra: {
      connectionTimeoutMillis: configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        30000,
      ),
    },
    retryAttempts: 5,
    retryDelay: 3000,
  };
};
