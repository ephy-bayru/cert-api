import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsService } from './services/documents.service';
import { DocumentsRepository } from './repository/documents.repository';
import { Document } from './entities/document.entity';
import { DocumentsController } from './controllers/documents.controller';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    AuditModule,
    NotificationsModule
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
