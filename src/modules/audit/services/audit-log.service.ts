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
import { CreateAuditLogDto } from '../dtos/create-audit-logs.dto';
import { CacheService } from 'src/common/services/cache.service';
import { ExportService } from 'src/common/services/export.service';
import { LoggerService } from 'src/common/services/logger.service';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { AuditAction } from '../enums/audit-action.enum';

@Injectable()
export class AuditLogService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly STATS_CACHE_TTL = 3600; // 1 hour

  constructor(
    private readonly auditLogRepository: AuditLogRepository,
    private readonly logger: LoggerService,
    private readonly cacheService: CacheService,
    private readonly exportService: ExportService,
  ) {}

  async createLog(logData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const validatedLogData = await this.validateDto(
        CreateAuditLogDto,
        logData,
      );
      const savedLog = await this.auditLogRepository.create(validatedLogData);
      this.logger.log('Audit log created', 'AuditLogService', {
        id: savedLog.id,
        action: savedLog.action,
      });
      await this.invalidateCache();
      return savedLog;
    } catch (error) {
      this.handleError('Error creating audit log', error, logData);
    }
  }

  async findAll(filters: GetAuditLogsDto): Promise<PaginationResult<AuditLog>> {
    try {
      const cacheKey = this.generateCacheKey(filters);
      return await this.cacheService.getOrSet(
        cacheKey,
        () => this.fetchAuditLogs(filters),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.handleError('Error fetching audit logs', error, filters);
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
      this.handleError('Error fetching audit log by ID', error, { id });
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.auditLogRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Audit log with ID ${id} not found`);
      }
      this.logger.log('Audit log deleted', 'AuditLogService', { id });
      await this.invalidateCache();
    } catch (error) {
      this.handleError('Error deleting audit log', error, { id });
    }
  }

  async getStatistics(): Promise<any> {
    try {
      const cacheKey = 'audit_log_statistics';
      return await this.cacheService.getOrSet(
        cacheKey,
        () => this.calculateStatistics(),
        this.STATS_CACHE_TTL,
      );
    } catch (error) {
      this.handleError('Error fetching audit log statistics', error);
    }
  }

  async exportAuditLogs(
    filters: GetAuditLogsDto,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    try {
      const { data } = await this.findAll(filters);

      const exportFormat = filters.exportFormat || 'csv';

      return await this.exportData(data, exportFormat);
    } catch (error) {
      this.handleError('Error exporting audit logs', error, filters);
    }
  }

  private async fetchAuditLogs(
    filters: GetAuditLogsDto,
  ): Promise<PaginationResult<AuditLog>> {
    const { page, limit, ...searchOptions } = filters;
    return await this.auditLogRepository.findAll({
      page,
      limit,
      options: this.buildFindOptions(searchOptions),
    });
  }

  async uploadDocumentLog(
    documentId: string,
    action: AuditAction,
    performedBy: string,
    metadata: any,
  ): Promise<AuditLog> {
    const logData: CreateAuditLogDto = {
      action,
      entityType: 'Document',
      entityId: documentId,
      performedById: performedBy,
      metadata,
    };
    return this.createLog(logData);
  }

  async getDocumentHistory(documentId: string): Promise<AuditLog[]> {
    try {
      const cacheKey = `document_history_${documentId}`;
      return await this.cacheService.getOrSet(
        cacheKey,
        () => this.auditLogRepository.findDocumentHistory(documentId),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.handleError('Error fetching document history', error, {
        documentId,
      });
    }
  }

  private buildFindOptions(filters: Partial<GetAuditLogsDto>): any {
    const options: any = { where: {} };

    if (filters.actions?.length)
      options.where.action = { $in: filters.actions };
    if (filters.entityTypes?.length)
      options.where.entityType = { $in: filters.entityTypes };
    if (filters.performedById)
      options.where.performedById = filters.performedById;
    if (filters.startDate)
      options.where.performedAt = { $gte: filters.startDate };
    if (filters.endDate)
      options.where.performedAt = {
        ...options.where.performedAt,
        $lte: filters.endDate,
      };
    if (filters.statuses?.length)
      options.where.status = { $in: filters.statuses };
    if (filters.ipAddress) options.where.ipAddress = filters.ipAddress;
    if (filters.entityId) options.where.entityId = filters.entityId;

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
    await this.cacheService.del('audit_logs_*');
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
    const [totalLogs, actionCounts, recentActivity] = await Promise.all([
      this.auditLogRepository.count(),
      this.auditLogRepository.getActionCounts(),
      this.auditLogRepository.getRecentActivity(),
    ]);

    return { totalLogs, actionCounts, recentActivity };
  }

  private async exportData(
    data: AuditLog[],
    format: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    switch (format) {
      case 'csv':
        return {
          buffer: await this.exportService.exportToCsv(data, 'audit_logs'),
          contentType: 'text/csv',
        };
      case 'json':
        return {
          buffer: await this.exportService.exportToJson(data),
          contentType: 'application/json',
        };
      case 'excel':
        return {
          buffer: await this.exportService.exportToExcel(data, 'audit_logs'),
          contentType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      default:
        throw new BadRequestException('Unsupported export format');
    }
  }

  private handleError(
    message: string,
    error: unknown,
    context?: unknown,
  ): never {
    this.logger.error(message, 'AuditLogService', { error, context });
    throw error instanceof BadRequestException ||
      error instanceof NotFoundException
      ? error
      : new BadRequestException(message);
  }
}
