import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
    const { page = 1, limit = 10 } = paginationOptions;

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
      });

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
}
