import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseLoggerService } from '../services/database-logger.service';
import { LoggerService } from 'src/common/services/logger.service';
import { typeormConfig } from 'src/config/typeorm.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, DatabaseLoggerService, LoggerService],
      useFactory: (
        configService: ConfigService,
        databaseLoggerService: DatabaseLoggerService,
        logger: LoggerService,
      ) => {
        try {
          const typeormOptions = typeormConfig(
            configService,
            databaseLoggerService,
            logger,
          );
          return typeormOptions;
        } catch (error) {
          logger.logError('Error configuring TypeORM', { error });
          throw new Error('Failed to configure TypeORM');
        }
      },
    }),
  ],
  providers: [DatabaseService, DatabaseLoggerService, LoggerService],
  exports: [DatabaseService, DatabaseLoggerService],
})
export class DatabaseModule {}
