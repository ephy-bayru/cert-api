import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseLoggerService } from '../services/database-logger.service';
import { typeormConfig } from 'src/config/typeorm.config';
import { LoggerService } from 'src/common/services/logger.service';

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
        loggerService: LoggerService,
      ) => {
        try {
          const typeormOptions = typeormConfig(
            configService,
            databaseLoggerService,
            loggerService,
          );
          loggerService.log(
            'TypeORM configuration loaded successfully',
            'DatabaseModule',
            { typeormOptions },
          );
          return typeormOptions;
        } catch (error) {
          loggerService.error('Error configuring TypeORM', 'DatabaseModule', {
            error: error instanceof Error ? error.message : String(error),
          });
          throw new Error('Failed to configure TypeORM');
        }
      },
    }),
  ],
  providers: [DatabaseService, DatabaseLoggerService],
  exports: [DatabaseService, DatabaseLoggerService],
})
export class DatabaseModule {}
