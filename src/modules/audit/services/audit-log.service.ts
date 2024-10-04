import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { AuditLog } from '../entities/audit-log.entity';
import { GetAuditLogsDto } from '../dtos/get-audit-logs.dto';
import { AuditLogRepository } from '../repositories/audit-log.repository';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { LoggerService } from 'src/common/services/logger.service';
import { CacheService } from 'src/common/services/cache.service';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { CreateAuditLogDto } from '../dtos/create-audit-logs.dto';
import { ExportService } from 'src/common/services/export.service';

@Injectable()
export class AuditLogService {
  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly exportService: ExportService,
  ) {
    this.logger.setContext('AuditLogService');
  }

  async createLog(logData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const validatedLogData = await this.validateDto(
        CreateAuditLogDto,
        logData,
      );
      const savedLog = await this.auditLogRepository.create(validatedLogData);
      this.logger.logInfo('Audit log created', {
        id: savedLog.id,
        action: savedLog.action,
      });
      await this.invalidateCache();
      return savedLog;
    } catch (error) {
      this.logger.logError('Error creating audit log', { error, logData });
      throw new BadRequestException('Failed to create audit log');
    }
  }

  async findAll(filters: GetAuditLogsDto): Promise<PaginationResult<AuditLog>> {
    try {
      const cacheKey = this.generateCacheKey(filters);
      const cachedResult =
        await this.cacheService.get<PaginationResult<AuditLog>>(cacheKey);

      if (cachedResult) {
        this.logger.logInfo('Returning cached audit logs');
        return cachedResult;
      }

      const { page, limit, ...searchOptions } = filters;
      const result = await this.auditLogRepository.findAll({
        page,
        limit,
        options: this.buildFindOptions(searchOptions),
      });

      await this.cacheService.set(cacheKey, result, 300); // Cache for 5 minutes

      return result;
    } catch (error) {
      this.logger.logError('Error fetching audit logs', { error, filters });
      throw new BadRequestException('Failed to fetch audit logs');
    }
  }

  async findById(id: string): Promise<AuditLog> {
    try {
      const auditLog = await this.auditLogRepository.findOne(id);
      if (!auditLog) {
        throw new NotFoundException(`Audit log with ID ${id} not found`);
      }
      return auditLog;
    } catch (error) {
      this.logger.logError('Error fetching audit log by ID', { error, id });
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.auditLogRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Audit log with ID ${id} not found`);
      }
      this.logger.logInfo('Audit log deleted', { id });
      await this.invalidateCache();
    } catch (error) {
      this.logger.logError('Error deleting audit log', { error, id });
      throw error;
    }
  }

  async getStatistics(): Promise<any> {
    try {
      const cacheKey = 'audit_log_statistics';
      const cachedStats = await this.cacheService.get<any>(cacheKey);

      if (cachedStats) {
        return cachedStats;
      }

      const stats = await this.calculateStatistics();
      await this.cacheService.set(cacheKey, stats, 3600); // Cache for 1 hour

      return stats;
    } catch (error) {
      this.logger.logError('Error fetching audit log statistics', { error });
      throw new BadRequestException('Failed to fetch audit log statistics');
    }
  }

  async exportAuditLogs(
    filters: GetAuditLogsDto,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const { data } = await this.findAll(filters);

      if (filters.exportFormat === 'csv') {
        const buffer = await this.exportService.exportToCsv(data, 'audit_logs');
        return { buffer, contentType: 'text/csv' };
      } else if (filters.exportFormat === 'json') {
        const buffer = await this.exportService.exportToJson(data);
        return { buffer, contentType: 'application/json' };
      } else if (filters.exportFormat === 'excel') {
        const buffer = await this.exportService.exportToExcel(
          data,
          'audit_logs',
        );
        return {
          buffer,
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      }

      throw new BadRequestException('Unsupported export format');
    } catch (error) {
      this.logger.logError('Error exporting audit logs', { error, filters });
      throw new BadRequestException('Failed to export audit logs');
    }
  }

  private buildFindOptions(filters: Partial<GetAuditLogsDto>): any {
    const options: any = { where: {} };

    if (filters.actions?.length) {
      options.where.action = { $in: filters.actions };
    }

    if (filters.entityTypes?.length) {
      options.where.entityType = { $in: filters.entityTypes };
    }

    if (filters.performedById) {
      options.where.performedById = filters.performedById;
    }

    if (filters.startDate) {
      options.where.performedAt = { $gte: filters.startDate };
    }

    if (filters.endDate) {
      options.where.performedAt = {
        ...options.where.performedAt,
        $lte: filters.endDate,
      };
    }

    if (filters.statuses?.length) {
      options.where.status = { $in: filters.statuses };
    }

    if (filters.ipAddress) {
      options.where.ipAddress = filters.ipAddress;
    }

    if (filters.entityId) {
      options.where.entityId = filters.entityId;
    }

    if (filters.searchTerm) {
      options.where.$or = [
        { action: { $ilike: `%${filters.searchTerm}%` } },
        { entityType: { $ilike: `%${filters.searchTerm}%` } },
        { details: { $ilike: `%${filters.searchTerm}%` } },
      ];
    }

    return options;
  }

  private generateCacheKey(filters: GetAuditLogsDto): string {
    return `audit_logs_${JSON.stringify(filters)}`;
  }

  private async invalidateCache(): Promise<void> {
    const cachePattern = 'audit_logs_*';
    await this.cacheService.del(cachePattern);
  }

  private async validateDto<T extends object>(
    dtoClass: ClassConstructor<T>,
    plainData: Record<string, any>,
  ): Promise<T> {
    const dto = plainToClass(dtoClass, plainData);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false },
    });

    if (errors.length > 0) {
      throw new BadRequestException(this.formatValidationErrors(errors));
    }

    return dto;
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map((error) => Object.values(error.constraints || {}).join(', '))
      .join('; ');
  }
  private async calculateStatistics(): Promise<any> {
    const totalLogs = await this.auditLogRepository.count();
    const actionCounts = await this.auditLogRepository.getActionCounts();
    const recentActivity = await this.auditLogRepository.getRecentActivity();

    return { totalLogs, actionCounts, recentActivity };
  }
}
