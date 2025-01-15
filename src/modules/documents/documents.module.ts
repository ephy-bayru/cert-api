import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './services/documents.service';
import { DocumentsRepository } from './repository/documents.repository';
import { Document } from './entities/document.entity';
import { DocumentsController } from './controllers/documents.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { S3Service } from './services/s3.service';
import { HashingService } from './services/hashing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    AuditModule,
    NotificationsModule
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository, S3Service, HashingService],
  exports: [DocumentsService, DocumentsRepository, S3Service, HashingService],
})
export class DocumentsModule {}
