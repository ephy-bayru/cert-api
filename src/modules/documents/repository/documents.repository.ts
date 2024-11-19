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
    const document = this.repository.create({
      ...createDocumentDto,
      owner: { id: userId } as any,
      uploader: { id: userId } as any,
      metadata: createDocumentDto.metadata
        ? JSON.parse(createDocumentDto.metadata)
        : undefined,
    });
    return this.repository.save(document);
  }

  async getDocument(id: string, userId: string): Promise<Document> {
    const document = await this.findOne({
      where: { id, ownerId: userId },
      relations: [
        'owner',
        'uploader',
        'verificationRequests',
        'verifiedByOrganizations',
      ],
    });
    if (!document) {
      throw new NotFoundException(
        `Document with ID "${id}" not found for user "${userId}"`,
      );
    }
    return document;
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
    await this.update({ id, owner: { id: userId } }, updateData);
    return this.getDocument(id, userId);
  }

  async softDeleteDocument(id: string, userId: string): Promise<void> {
    const result = await this.update(
      { id, ownerId: userId },
      { isDeleted: true },
    );
    if (result.affected === 0) {
      throw new NotFoundException(
        `Document with ID "${id}" not found for user "${userId}"`,
      );
    }
  }

  // Document Submission and Workflow
  async submitDocumentForVerification(
    id: string,
    organizationIds: string[],
    userId: string,
  ): Promise<Document> {
    const document = await this.getDocument(id, userId);
    document.status = DocumentStatus.PENDING_VERIFICATION;
    document.verificationRequests = organizationIds.map(
      (orgId) => ({ id: orgId }) as any,
    );
    return this.repository.save(document);
  }

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
    if (!document.verificationStatuses) {
      document.verificationStatuses = {};
    }
    document.verificationStatuses[organizationId] = newStatus;
    return this.repository.save(document);
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
        relations: ['verificationRequests', 'verifiedByOrganizations'],
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
      .innerJoin('document.verifiedByOrganizations', 'org', 'org.id = :orgId', {
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
      queryBuilder.andWhere(
        '(document.title ILIKE :searchTerm OR ' +
          'document.description ILIKE :searchTerm OR ' +
          'document.documentType ILIKE :searchTerm OR ' +
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
    document.verificationRequests = organizationIds.map(
      (orgId) => ({ id: orgId }) as any,
    );
    return this.repository.save(document);
  }

  // Composite Status
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

  // New methods
  async getDocumentsByIds(ids: string[]): Promise<Document[]> {
    return this.repository.find({
      where: { id: In(ids), isDeleted: false },
      relations: ['owner', 'verificationRequests', 'verifiedByOrganizations'],
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
        acc[status] = parseInt(count);
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
      relations: ['verificationRequests', 'verifiedByOrganizations'],
    });
  }
}
