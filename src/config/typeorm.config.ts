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
      logger.logError(`Database configuration error: ${key} is missing`);
      throw new Error(`Database configuration error: ${key} is missing`);
    }
  }

  const entities = configService.get<string>(
    'TYPEORM_ENTITIES',
    isProduction ? 'dist/**/*.entity{.js,.ts}' : 'src/**/*.entity{.js,.ts}',
  );
  const migrations = configService.get<string>(
    'TYPEORM_MIGRATIONS',
    isProduction ? 'dist/migrations/*{.js,.ts}' : 'src/migrations/*{.js,.ts}',
  );

  // Fetch logging level or options from environment or use custom logger service
  const loggingOptions: LoggerOptions | 'all' =
    databaseLoggerService.determineDatabaseLoggingOptions();

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [entities],
    autoLoadEntities: true,
    synchronize: configService.get<boolean>('TYPEORM_SYNC', !isProduction),
    migrationsRun: configService.get<boolean>('TYPEORM_MIGRATIONS_RUN', true),
    migrations: [migrations],
    logging: loggingOptions,
    ssl: sslOptions,
    extra: {
      connectionTimeoutMillis: configService.get<number>(
        'DB_CONNECTION_TIMEOUT',
        3000,
      ),
    },
  };
};
