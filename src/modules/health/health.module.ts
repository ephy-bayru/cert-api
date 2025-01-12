import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { CustomHealthIndicator } from './indicators/custom.health';
import { DocumentsModule } from '@modules/documents/documents.module';

@Module({
  imports: [TerminusModule, HttpModule, DocumentsModule],
  controllers: [HealthController],
  providers: [CustomHealthIndicator],
})
export class HealthModule {}
