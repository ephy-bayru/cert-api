import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { Document } from '../entities/document.entity';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { DocumentStatus } from '../entities/document-status.enum';
import {
  DocumentFilters,
  DocumentSearchParams,
} from '../interfaces/document-filters.interface';
import { UploadDocumentDto } from '../dtos/upload-document.dto';
import { UpdateDocumentDto } from '../dtos/update-document.dto';

@Injectable()
export class DocumentsRepository extends BaseRepository<Document> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, Document, logger);
  }

  // ---- Create Document ----
  async buildDocumentEntity(
    createDocumentDto: UploadDocumentDto,
    userId: string,
  ): Promise<Document> {
    let parsedMetadata: any;
    if (createDocumentDto.metadata) {
      try {
        parsedMetadata = JSON.parse(createDocumentDto.metadata);
      } catch (err) {
        this.logger.error('Invalid JSON in metadata', 'DocumentsRepository.buildDocumentEntity', {
          error: err,
        });
      }
    }

    // Create the Document entity without saving
    const docEntity = this.repository.create({
      title: createDocumentDto.title,
      description: createDocumentDto.description,
      documentType: createDocumentDto.documentType as any,
      expiryDate: createDocumentDto.expiryDate,
      tags: createDocumentDto.tags,
      status: createDocumentDto.status || DocumentStatus.DRAFT,

      fileUrl: '',      // Will be set later
      fileHash: '',     // If you compute a hash, do it later
      fileSize: 0,      // Initially zero, but won't be saved yet
      fileType: '',

      uploader: { id: createDocumentDto.uploaderId } as any,

      // If you want the user performing creation to be the owner by default
      owner: { id: userId } as any,
      ownerId: userId,

      metadata: parsedMetadata,
    });

    // Return the unsaved doc entity
    return docEntity;
  }

  // ---- Get a single Document ----
  async getDocument(id: string, userId: string): Promise<Document> {
    return this.findOne({
      where: { id, ownerId: userId },
      relations: [
        'owner',
        'uploader',
        'organizationsWithAccess',
        'verifications',
      ],
    });
  }

  // ---- Update Document ----
  async updateDocument(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ): Promise<Document> {
    let parsedMetadata: any;
    if (updateDocumentDto.metadata) {
      try {
        parsedMetadata = JSON.parse(updateDocumentDto.metadata);
      } catch (err) {
        this.logger.error(
          'Invalid JSON in updateDocument metadata',
          'DocumentsRepository.updateDocument',
        );
      }
    }

    const updateData: Partial<Document> = {
      ...updateDocumentDto,
      metadata: parsedMetadata,
    };

    await this.update({ id, ownerId: userId }, updateData);
    return this.getDocument(id, userId);
  }

  // ---- Soft Delete Document ----
  async softDeleteDocument(id: string, userId: string): Promise<void> {
    await this.update({ id, ownerId: userId }, { isDeleted: true });
  }

  // ---- Submit Document for Verification ----
  async submitDocumentForVerification(
    id: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    const document = await this.getDocument(id, userId);
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    document.status = DocumentStatus.PENDING_VERIFICATION;
    return this.save(document);
  }

  // ---- Change Document Status ----
  async changeDocumentStatus(
    id: string,
    newStatus: DocumentStatus,
    organizationId: string,
  ): Promise<Document> {
    const document = await this.findOne(id);
    if (!document) {
      throw new NotFoundException(`Document with ID "${id}" not found`);
    }
    document.status = newStatus;
    document.verificationStatuses = document.verificationStatuses || {};
    document.verificationStatuses[organizationId] = newStatus;

    return this.save(document);
  }

  // ---- Document Retrieval & Listing ----
  async getDocumentsByUser(
    userId: string,
    filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    const whereClause: FindOptionsWhere<Document> = {
      ownerId: userId,
      isDeleted: false,
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    return this.findAll({
      page: filters.page,
      limit: filters.limit,
      options: {
        where: whereClause,
        relations: ['organizationsWithAccess', 'verifications'],
        order: { createdAt: 'DESC' },
      },
    });
  }

  async getDocumentsByOrganization(
    orgId: string,
    filters: DocumentFilters,
  ): Promise<PaginationResult<Document>> {
    const qb = this.repository
      .createQueryBuilder('document')
      .innerJoin('document.organizationsWithAccess', 'org', 'org.id = :orgId', {
        orgId,
      })
      .where('document.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      qb.andWhere('document.status = :status', { status: filters.status });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    qb.orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async searchDocuments(
    searchParams: DocumentSearchParams,
  ): Promise<PaginationResult<Document>> {
    const qb = this.repository
      .createQueryBuilder('document')
      .where('document.isDeleted = :isDeleted', { isDeleted: false });

    if (searchParams.searchTerm) {
      qb.andWhere(
        '(document.title ILIKE :searchTerm OR ' +
          'document.description ILIKE :searchTerm OR ' +
          'document.documentType::text ILIKE :searchTerm OR ' +
          ':searchTerm = ANY(document.tags))',
        { searchTerm: `%${searchParams.searchTerm}%` },
      );
    }

    if (searchParams.status) {
      qb.andWhere('document.status = :status', {
        status: searchParams.status,
      });
    }

    if (searchParams.startDate) {
      qb.andWhere('document.createdAt >= :startDate', {
        startDate: searchParams.startDate,
      });
    }

    if (searchParams.endDate) {
      qb.andWhere('document.createdAt <= :endDate', {
        endDate: searchParams.endDate,
      });
    }

    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;

    qb.orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // ---- Access Control ----
  async grantDocumentAccess(
    documentId: string,
    organizationId: string,
  ): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .relation(Document, 'organizationsWithAccess')
        .of(documentId)
        .add(organizationId);
    } catch (error) {
      throw new NotFoundException(`Document with ID "${documentId}" not found`);
    }
  }

  async revokeDocumentAccess(
    documentId: string,
    organizationId: string,
  ): Promise<void> {
    try {
      await this.repository
        .createQueryBuilder()
        .relation(Document, 'organizationsWithAccess')
        .of(documentId)
        .remove(organizationId);
    } catch (error) {
      throw new NotFoundException(
        `Document with ID "${documentId}" not found or organization doesn't have access`,
      );
    }
  }

  // ---- Expiration ----
  async checkDocumentExpiration(): Promise<void> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Document)
      .set({ status: DocumentStatus.EXPIRED })
      .where('expiryDate <= :now', { now: new Date() })
      .andWhere('status != :expiredStatus', {
        expiredStatus: DocumentStatus.EXPIRED,
      })
      .execute();

    this.logger.log(
      `Updated ${result.affected} documents to EXPIRED status`,
      'checkDocumentExpiration',
    );
  }

  // ---- Re-Verification ----
  async initiateReVerification(
    documentId: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    const document = await this.getDocument(documentId, userId);
    if (!document) {
      throw new NotFoundException(
        `Document with ID "${documentId}" not found for user ${userId}`,
      );
    }
    document.status = DocumentStatus.PENDING_VERIFICATION;
    return this.save(document);
  }

  // ---- Composite Status ----
  async getDocumentCompositeStatus(documentId: string): Promise<{
    overallStatus: DocumentStatus;
    organizationStatuses: Record<string, DocumentStatus>;
  }> {
    const document = await this.findOne(documentId);
    if (!document) {
      throw new NotFoundException(`Document with ID "${documentId}" not found`);
    }
    return {
      overallStatus: document.status,
      organizationStatuses: document.verificationStatuses || {},
    };
  }

  // ---- Additional Methods ----
  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    return this.repository.find({
      where: { id: In(ids), isDeleted: false },
      relations: ['owner', 'organizationsWithAccess', 'verifications'],
    });
  }

  async countDocumentsByStatus(
    userId: string,
  ): Promise<Record<DocumentStatus, number>> {
    const result = await this.repository
      .createQueryBuilder('document')
      .select('document.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('document.ownerId = :userId', { userId })
      .andWhere('document.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy('document.status')
      .getRawMany();

    return result.reduce(
      (acc, { status, count }) => {
        acc[status] = parseInt(count, 10);
        return acc;
      },
      {} as Record<DocumentStatus, number>,
    );
  }

  async getRecentDocuments(
    userId: string,
    limit: number = 5,
  ): Promise<Document[]> {
    return this.repository.find({
      where: { ownerId: userId, isDeleted: false },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['organizationsWithAccess', 'verifications'],
    });
  }
}
