import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { DatabaseLoggerService } from '../services/database-logger.service';
import { typeormConfig } from 'src/config/typeorm.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService, DatabaseLoggerService],
      useFactory: async (
        configService: ConfigService,
        databaseLoggerService: DatabaseLoggerService,
      ) => {
        try {
          const typeormOptions = typeormConfig(
            configService,
            databaseLoggerService,
          );
          return {
            ...typeormOptions,
            logging: databaseLoggerService.determineDatabaseLoggingOptions(),
          };
        } catch (error) {
          console.error('Error configuring TypeORM:', error);
          throw new Error('Failed to configure TypeORM');
        }
      },
    }),
  ],
  providers: [DatabaseService, DatabaseLoggerService],
  exports: [DatabaseService, DatabaseLoggerService],
})
export class DatabaseModule {}
