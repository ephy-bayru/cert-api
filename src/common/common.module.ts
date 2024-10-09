import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { LoggerService } from './services/logger.service';
import { ExportService } from './services/export.service';

@Global()
@Module({
  imports: [CacheModule.register({}), ConfigModule],
  providers: [
    CacheService,
    ExportService,
    {
      provide: LoggerService,
      useFactory: (configService: ConfigService) =>
        new LoggerService(configService, {
          logToFile: true,
          logDir: 'logs',
          maxLogSize: 1048576,
          maxFiles: 5,
        }),
      inject: [ConfigService],
    },
  ],
  exports: [LoggerService, CacheService, ExportService],
})
export class CommonModule {}
