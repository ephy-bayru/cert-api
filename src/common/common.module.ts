import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { CacheService } from './services/cache.service';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  imports: [CacheModule.register({}), ConfigModule],
  providers: [LoggerService, CacheService],
  exports: [LoggerService, CacheService],
})
export class CommonModule {}
