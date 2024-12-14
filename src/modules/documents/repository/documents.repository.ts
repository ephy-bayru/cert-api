import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, FindOptionsWhere, In } from 'typeorm';
import { Document } from '../entities/document.entity';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { CreateDocumentDto } from '../dtos/create-document.dto';
import { UpdateDocumentDto } from '../dtos/update-document.dto';
import { DocumentStatus } from '../entities/document-status.enum';
import {
  DocumentFilters,
  DocumentSearchParams,
} from '../interfaces/document-filters.interface';

@Injectable()
export class DocumentsRepository extends BaseRepository<Document> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, Document, logger);
  }

  // CRUD Operations
  async createDocument(
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): Promise<Document> {
    // Convert metadata if needed
    const metadata = createDocumentDto.metadata
      ? JSON.parse(createDocumentDto.metadata)
      : undefined;

    // Ensure documentType is an enum (if needed)
    // Assuming createDocumentDto.documentType is already a valid DocumentType enum
    return this.create({
      ...createDocumentDto,
      owner: { id: userId } as any,
      uploader: { id: userId } as any,
      metadata,
    });
  }

  async getDocument(id: string, userId: string): Promise<Document> {
    // Removed 'verificationRequests' and 'verifiedByOrganizations' from relations
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

  async updateDocument(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    userId: string,
  ): Promise<Document> {
    const updateData: Partial<Document> = {
      ...updateDocumentDto,
      metadata: updateDocumentDto.metadata
        ? JSON.parse(updateDocumentDto.metadata)
        : undefined,
    };

    // Convert documentType if it's still a string
    // updateData.documentType = DocumentType[updateDocumentDto.documentType.toUpperCase()];

    await this.update({ id, owner: { id: userId } }, updateData);
    return this.getDocument(id, userId);
  }

  async softDeleteDocument(id: string, userId: string): Promise<void> {
    await this.update({ id, ownerId: userId }, { isDeleted: true });
  }

  // Document Submission and Workflow
  async submitDocumentForVerification(
    id: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    const document = await this.getDocument(id, userId);
    document.status = DocumentStatus.PENDING_VERIFICATION;
    // Previously: document.verificationRequests = organizationIds.map(...)
    // Instead, handle the creation of Verification entities outside this method,
    // or add logic here to create Verifications.
    return this.save(document);
  }

  async changeDocumentStatus(
    id: string,
    newStatus: DocumentStatus,
    organizationId: string,
  ): Promise<Document> {
    const document = await this.findOne(id);
    document.status = newStatus;

    // Assuming verificationStatuses is now a Record<string, DocumentStatus>
    document.verificationStatuses = document.verificationStatuses || {};
    document.verificationStatuses[organizationId] = newStatus;

    return this.save(document);
  }

  // Document Retrieval and Listing
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
    const queryBuilder = this.repository
      .createQueryBuilder('document')
      .innerJoin('document.organizationsWithAccess', 'org', 'org.id = :orgId', {
        orgId,
      })
      .where('document.isDeleted = :isDeleted', { isDeleted: false });

    if (filters.status) {
      queryBuilder.andWhere('document.status = :status', {
        status: filters.status,
      });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;

    queryBuilder
      .orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  async searchDocuments(
    searchParams: DocumentSearchParams,
  ): Promise<PaginationResult<Document>> {
    const queryBuilder = this.repository
      .createQueryBuilder('document')
      .where('document.isDeleted = :isDeleted', { isDeleted: false });

    if (searchParams.searchTerm) {
      // Depending on how documentType is stored (enum in DB), this ILIKE might not work well.
      // Consider casting or only searching text fields.
      queryBuilder.andWhere(
        '(document.title ILIKE :searchTerm OR ' +
          'document.description ILIKE :searchTerm OR ' +
          'document.documentType::text ILIKE :searchTerm OR ' +
          ':searchTerm = ANY(document.tags))',
        { searchTerm: `%${searchParams.searchTerm}%` },
      );
    }

    if (searchParams.status) {
      queryBuilder.andWhere('document.status = :status', {
        status: searchParams.status,
      });
    }

    if (searchParams.startDate) {
      queryBuilder.andWhere('document.createdAt >= :startDate', {
        startDate: searchParams.startDate,
      });
    }

    if (searchParams.endDate) {
      queryBuilder.andWhere('document.createdAt <= :endDate', {
        endDate: searchParams.endDate,
      });
    }

    const page = searchParams.page || 1;
    const limit = searchParams.limit || 10;

    queryBuilder
      .orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    return { data, total, page, limit };
  }

  // Access Control
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

  // Document Expiration
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

  async initiateReVerification(
    documentId: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    const document = await this.getDocument(documentId, userId);
    document.status = DocumentStatus.PENDING_VERIFICATION;
    // Previously: document.verificationRequests = ...
    // If you need to track re-verification requests, consider creating Verification entities.
    return this.save(document);
  }

  // Composite Status
  async getDocumentCompositeStatus(documentId: string): Promise<{
    overallStatus: DocumentStatus;
    organizationStatuses: Record<string, DocumentStatus>;
  }> {
    const document = await this.findOne(documentId);
    // Assuming verificationStatuses is now a Record<string, DocumentStatus>
    return {
      overallStatus: document.status,
      organizationStatuses: document.verificationStatuses || {},
    };
  }

  // New methods
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
