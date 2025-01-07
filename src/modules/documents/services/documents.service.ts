import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Document } from '../entities/document.entity';
import { UpdateDocumentDto } from '../dtos/update-document.dto';
import { DocumentStatus } from '../entities/document-status.enum';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import {
  DocumentFilters,
  DocumentSearchParams,
} from '../interfaces/document-filters.interface';
import { AuditLogService } from '../../audit/services/audit-log.service';
import { LoggerService } from 'src/common/services/logger.service';
import { AuditAction } from '../../audit/enums/audit-action.enum';
import { NotificationService } from '@modules/notifications/services/notifications.service';
import { DocumentsRepository } from '../repository/documents.repository';
import { NotificationPriority } from '@modules/notifications/enums/notification-priority.enum';
import {
  NotificationContentType,
  NotificationType,
} from '@modules/notifications/entities/notification-type.enum';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { S3Service } from './s3.service';
import { EncryptionType } from '../entities/encryption-type';
@Injectable()
export class DocumentsService {
  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
    private readonly logger: LoggerService,
    private readonly s3Service: S3Service,
  ) {}

  async createDocument(
    createDocumentDto: UploadDocumentDto,
    userId: string,
    file?: Express.Multer.File,
  ): Promise<Document> {
    try {
      // 1. S3 upload if file is provided
      let s3Key: string | undefined;
      if (file) {
        s3Key = await this.s3Service.uploadFile(
          file.buffer,
          file.originalname,
          'documents',
          EncryptionType.NONE,
        );
      }

      // 2. Create DB record
      const document = await this.documentsRepository.createDocument(
        createDocumentDto,
        userId,
      );

      // 3. If S3 upload happened, update file info
      if (s3Key && file) {
        document.fileUrl = s3Key;
        document.fileSize = file.size;
        document.fileType = file.mimetype;
        // If you have a hash, set it here
        // document.fileHash = someComputedHash(file)
        await this.documentsRepository.save(document);
      }

      // 4. Create Audit Log
      await this.auditLogService.uploadDocumentLog(
        document.id,
        AuditAction.UPLOAD_DOCUMENT,
        userId,
        { documentId: document.id },
      );

      // 5. Notifications
      await this.notificationService.createNotification({
        type: NotificationType.IN_APP,
        contentType: NotificationContentType.DOCUMENT_UPLOADED,
        message: `New document "${document.title}" created`,
        priority: NotificationPriority.NORMAL,
        userId: userId,
      });

      return document;
    } catch (error) {
      this.logger.error('Error uploading document', 'DocumentsService', {
        error,
        userId,
      });
      throw new BadRequestException('Error uploading document');
    }
  }

  async getDocument(id: string, userId: string): Promise<Document> {
    const document = await this.documentsRepository.getDocument(id, userId);
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    return document;
  }

  async updateDocument(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ): Promise<Document> {
    try {
      const document = await this.documentsRepository.updateDocument(
        id,
        updateDocumentDto,
        userId,
      );
      await this.auditLogService.uploadDocumentLog(
        id,
        AuditAction.UPDATE_DOCUMENT,
        userId,
        { documentId: id, updates: updateDocumentDto },
      );
      return document;
    } catch (error) {
      this.logger.error('Error updating document', 'DocumentsService', {
        error,
        id,
        userId,
      });
      throw new BadRequestException('Error updating document');
    }
  }

  async deleteDocument(id: string, userId: string): Promise<void> {
    try {
      await this.documentsRepository.softDeleteDocument(id, userId);
      await this.auditLogService.uploadDocumentLog(
        id,
        AuditAction.DELETE_DOCUMENT,
        userId,
        { documentId: id },
      );
    } catch (error) {
      this.logger.error('Error deleting document', 'DocumentsService', {
        error,
        id,
        userId,
      });
      throw new BadRequestException('Error deleting document');
    }
  }

  async submitDocumentForVerification(
    id: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    try {
      const document =
        await this.documentsRepository.submitDocumentForVerification(
          id,
          organizationIds,
          userId,
        );
      // Audit & Notification logic
      await this.auditLogService.uploadDocumentLog(
        id,
        AuditAction.DOCUMENT_SUBMITTED_FOR_VERIFICATION,
        userId,
        { documentId: id, organizationIds },
      );

      for (const orgId of organizationIds) {
        await this.notificationService.createNotification({
          type: NotificationType.IN_APP,
          contentType: NotificationContentType.DOCUMENT_VERIFICATION_REQUESTED,
          message: `New document "${document.title}" submitted for verification`,
          priority: NotificationPriority.HIGH,
          organizationId: orgId,
        });
      }

      return document;
    } catch (error) {
      this.logger.error(
        'Error submitting document for verification',
        'DocumentsService',
        { error, id, userId },
      );
      throw new BadRequestException(
        'Error submitting document for verification',
      );
    }
  }

  async changeDocumentStatus(
    id: string,
    newStatus: DocumentStatus,
    organizationId: string,
  ): Promise<Document> {
    try {
      const document = await this.documentsRepository.changeDocumentStatus(
        id,
        newStatus,
        organizationId,
      );
      await this.auditLogService.uploadDocumentLog(
        id,
        AuditAction.DOCUMENT_STATUS_CHANGED,
        organizationId,
        { documentId: id, newStatus },
      );

      await this.notificationService.createNotification({
        type: NotificationType.IN_APP,
        contentType: NotificationContentType.DOCUMENT_STATUS_UPDATED,
        message: `Document "${document.title}" status changed to ${newStatus}`,
        priority: NotificationPriority.NORMAL,
        userId: document.ownerId,
      });

      return document;
    } catch (error) {
      this.logger.error('Error changing document status', 'DocumentsService', {
        error,
        id,
        newStatus,
        organizationId,
      });
      throw new BadRequestException('Error changing document status');
    }
  }

  async getDocumentsByUser(
    userId: string,
    filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    return this.documentsRepository.getDocumentsByUser(userId, filters);
  }

  async getDocumentsByOrganization(
    orgId: string,
    filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    return this.documentsRepository.getDocumentsByOrganization(orgId, filters);
  }

  async searchDocuments(
    searchParams: DocumentSearchParams,
  ): Promise<PaginationResult<Document>> {
    return this.documentsRepository.searchDocuments(searchParams);
  }

  async grantDocumentAccess(
    documentId: string,
    organizationId: string,
    grantedByUserId: string,
  ): Promise<void> {
    try {
      await this.documentsRepository.grantDocumentAccess(
        documentId,
        organizationId,
      );
      await this.auditLogService.uploadDocumentLog(
        documentId,
        AuditAction.GRANT_DOCUMENT_ACCESS,
        grantedByUserId,
        { documentId, organizationId },
      );

      await this.notificationService.createNotification({
        type: NotificationType.IN_APP,
        contentType: NotificationContentType.CUSTOM_NOTIFICATION,
        message: `You have been granted access to a document`,
        priority: NotificationPriority.NORMAL,
        organizationId: organizationId,
      });
    } catch (error) {
      this.logger.error('Error granting document access', 'DocumentsService', {
        error,
        documentId,
        organizationId,
        grantedByUserId,
      });
      throw new BadRequestException('Error granting document access');
    }
  }

  async revokeDocumentAccess(
    documentId: string,
    organizationId: string,
    revokedByUserId: string,
  ): Promise<void> {
    try {
      await this.documentsRepository.revokeDocumentAccess(
        documentId,
        organizationId,
      );
      await this.auditLogService.uploadDocumentLog(
        documentId,
        AuditAction.REVOKE_DOCUMENT_ACCESS,
        revokedByUserId,
        { documentId, organizationId },
      );

      await this.notificationService.createNotification({
        type: NotificationType.IN_APP,
        contentType: NotificationContentType.CUSTOM_NOTIFICATION,
        message: `Your access to a document has been revoked`,
        priority: NotificationPriority.HIGH,
        organizationId: organizationId,
      });
    } catch (error) {
      this.logger.error('Error revoking document access', 'DocumentsService', {
        error,
        documentId,
        organizationId,
        revokedByUserId,
      });
      throw new BadRequestException('Error revoking document access');
    }
  }

  async checkDocumentExpiration(): Promise<void> {
    await this.documentsRepository.checkDocumentExpiration();
    // You might want to add notifications for expired documents here
  }

  async initiateReVerification(
    documentId: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    try {
      const document = await this.documentsRepository.initiateReVerification(
        documentId,
        organizationIds,
        userId,
      );
      // Audit & Notification
      await this.auditLogService.uploadDocumentLog(
        documentId,
        AuditAction.INITIATE_VERIFICATION,
        userId,
        { documentId, organizationIds },
      );

      for (const orgId of organizationIds) {
        await this.notificationService.createNotification({
          type: NotificationType.IN_APP,
          contentType: NotificationContentType.DOCUMENT_VERIFICATION_REQUESTED,
          message: `Document "${document.title}" requires re-verification`,
          priority: NotificationPriority.HIGH,
          organizationId: orgId,
        });
      }

      return document;
    } catch (error) {
      this.logger.error(
        'Error initiating re-verification',
        'DocumentsService',
        { error, documentId, userId },
      );
      throw new BadRequestException('Error initiating re-verification');
    }
  }

  async getDocumentCompositeStatus(documentId: string): Promise<{
    overallStatus: DocumentStatus;
    organizationStatuses: Record<string, DocumentStatus>;
  }> {
    return this.documentsRepository.getDocumentCompositeStatus(documentId);
  }

  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    return this.documentsRepository.getDocumentsByIds(ids);
  }

  async countDocumentsByStatus(
    userId: string,
  ): Promise<Record<DocumentStatus, number>> {
    return this.documentsRepository.countDocumentsByStatus(userId);
  }

  async getRecentDocuments(
    userId: string,
    limit: number = 5,
  ): Promise<Document[]> {
    return this.documentsRepository.getRecentDocuments(userId, limit);
  }
}
