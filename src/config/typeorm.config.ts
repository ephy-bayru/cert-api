import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { LoggerOptions } from 'typeorm';
import * as fs from 'fs';
import { DatabaseLoggerService } from 'src/core/services/database-logger.service';

/**
 * Streamlines the preparation of SSL options for the database connection, focusing on error handling and simplicity.
 * @param configService Access to environment variables for configuration.
 * @returns A structured object with SSL configuration or null if SSL is not configured or fails.
 */
function prepareSslOptions(
  configService: ConfigService,
): { rejectUnauthorized: boolean; ca?: string } | null {
  const useSSL = configService.get<boolean>('DB_SSL', true);

  if (!useSSL) {
    console.log('Database connection SSL is disabled.');
    return null;
  }

  const rejectUnauthorized = configService.get<boolean>(
    'DB_SSL_REJECT_UNAUTHORIZED',
    true,
  );

  const sslCertPath = configService.get<string>('DB_SSL_CERT_PATH', '');
  let ca: string | undefined;

  if (sslCertPath) {
    try {
      ca = fs.readFileSync(sslCertPath, 'utf8');
    } catch (error) {
      console.error(
        `Error loading SSL certificate from path "${sslCertPath}":`,
        error,
      );
    }
  }

  return ca ? { rejectUnauthorized, ca } : { rejectUnauthorized };
}

/**
 * Generates the TypeORM module options with advanced configuration,
 * including SSL, logging, and migrations setup.
 * @param configService The configuration service used for accessing environment variables.
 * @param loggerService Optional custom logger service for TypeORM logging.
 * @returns TypeOrmModuleOptions with advanced settings.
 */
export const typeormConfig = (
  configService: ConfigService,
  databaseLoggerService: DatabaseLoggerService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const sslOptions = prepareSslOptions(configService);

  // Fetch logging level or options from environment or use custom logger service
  const loggingOptions: LoggerOptions | 'all' =
    databaseLoggerService.determineDatabaseLoggingOptions();

  // Ensure mandatory configuration is present
  const requiredConfig = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  requiredConfig.forEach((key) => {
    if (!configService.get<string>(key)) {
      throw new Error(`Database configuration error: ${key} is missing`);
    }
  });

  const entities = configService.get<string>(
    'TYPEORM_ENTITIES',
    isProduction ? 'dist/**/*.entity{.ts,.js}' : 'src/**/*.entity{.ts,.js}',
  );
  const migrations = configService.get<string>(
    'TYPEORM_MIGRATIONS',
    isProduction ? 'dist/migrations/*{.ts,.js}' : 'src/migrations/*{.ts,.js}',
  );

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
