import { Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    logger: LoggerService,
  ) {
    super(dataSource, AuditLog, logger);
  }

  async getActionCounts(): Promise<{ action: string; count: number }[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('auditLog')
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action');
    const result = await queryBuilder.getRawMany();
    return result.map((item) => ({
      action: item.action,
      count: parseInt(item.count, 10),
    }));
  }

  async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    const result = await this.findAll({
      page: 1,
      limit,
      options: {
        order: { performedAt: 'DESC' },
        relations: ['performedBy'],
      },
    });
    return result.data;
  }

  async searchAuditLogs(
    searchTerm: string,
    paginationOptions: PaginationOptions<AuditLog>,
  ): Promise<PaginationResult<AuditLog>> {
    const { page = 1, limit = 10, options = {} } = paginationOptions;
    const queryBuilder = this.repository.createQueryBuilder('auditLog');

    queryBuilder
      .where('auditLog.action ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('auditLog.entityType ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('auditLog.details ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      })
      .orWhere('auditLog.metadata::text ILIKE :searchTerm', {
        searchTerm: `%${searchTerm}%`,
      });

    if (options.where) {
      Object.entries(options.where).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          queryBuilder.andWhere(`auditLog.${key} IN (:...${key})`, {
            [key]: value,
          });
        } else {
          queryBuilder.andWhere(`auditLog.${key} = :${key}`, { [key]: value });
        }
      });
    }

    if (options.order) {
      Object.entries(options.order).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`auditLog.${key}`, value as 'ASC' | 'DESC');
      });
    } else {
      queryBuilder.addOrderBy('auditLog.performedAt', 'DESC');
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findDocumentHistory(documentId: string): Promise<AuditLog[]> {
    return this.repository.find({
      where: {
        entityType: 'Document',
        entityId: documentId,
      },
      order: {
        performedAt: 'DESC',
      },
      relations: ['performedBy'],
    });
  }

  async getDocumentActionCounts(
    documentId: string,
  ): Promise<{ action: string; count: number }[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('auditLog')
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('auditLog.entityType = :entityType', { entityType: 'Document' })
      .andWhere('auditLog.entityId = :documentId', { documentId })
      .groupBy('auditLog.action');

    const result = await queryBuilder.getRawMany();
    return result.map((item) => ({
      action: item.action,
      count: parseInt(item.count, 10),
    }));
  }

  async findRecentDocumentChanges(
    documentIds: string[],
    limit: number = 10,
  ): Promise<AuditLog[]> {
    return this.repository.find({
      where: {
        entityType: 'Document',
        entityId: In(documentIds),
      },
      order: {
        performedAt: 'DESC',
      },
      take: limit,
      relations: ['performedBy'],
    });
  }
}
