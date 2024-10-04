import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { LoggerService } from './services/logger.service';
import { ExportService } from './services/export.service';

@Global()
@Module({
  imports: [CacheModule.register({}), ConfigModule],
  providers: [LoggerService, CacheService, ExportService],
  exports: [LoggerService, CacheService, ExportService],
})
export class CommonModule {}
