import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogService } from './services/audit-log.service';
import { AuditLogController } from './controllers/audit.controller';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService, AuditLogRepository],
  controllers: [AuditLogController],
  exports: [AuditLogService, AuditLogRepository],
})
export class AuditModule {}
