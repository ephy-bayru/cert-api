import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  ParseUUIDPipe,
  Res,
  HttpStatus,
  HttpCode,
  Global,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuditLog } from '../entities/audit-log.entity';
import { GetAuditLogsDto } from '../dtos/get-audit-logs.dto';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import {
  CreateAuditLogDocs,
  DeleteAuditLogDocs,
  ExportAuditLogsDocs,
  GetAuditLogByIdDocs,
  GetAuditLogsDocs,
  GetAuditLogStatisticsDocs,
} from '../documentation/audit-log.controller.documentation';
import { CreateAuditLogDto } from '../dtos/create-audit-logs.dto';
import { GlobalRole } from '@common/enums/global-role.enum';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller({ path: 'audit-logs', version: '1' })
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @GetAuditLogsDocs()
  @HttpCode(HttpStatus.OK)
  async getAuditLogs(
    @Query() query: GetAuditLogsDto,
  ): Promise<PaginationResult<AuditLog>> {
    return this.auditLogService.findAll(query);
  }

  @Get(':id')
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @GetAuditLogByIdDocs()
  @HttpCode(HttpStatus.OK)
  async getAuditLogById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AuditLog> {
    const auditLog = await this.auditLogService.findById(id);
    if (!auditLog) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }
    return auditLog;
  }

  @Post()
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @CreateAuditLogDocs()
  @HttpCode(HttpStatus.CREATED)
  async createAuditLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditLogService.createLog(createAuditLogDto);
  }

  @Delete(':id')
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @DeleteAuditLogDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAuditLog(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.auditLogService.delete(id);
  }

  @Get('statistics')
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @GetAuditLogStatisticsDocs()
  @HttpCode(HttpStatus.OK)
  async getAuditLogStatistics(): Promise<any> {
    return this.auditLogService.getStatistics();
  }

  @Get('export')
  @Roles(GlobalRole.PLATFORM_ADMIN)
  @ExportAuditLogsDocs()
  @HttpCode(HttpStatus.OK)
  async exportAuditLogs(
    @Query() query: GetAuditLogsDto,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, contentType } =
      await this.auditLogService.exportAuditLogs(query);
    res.setHeader('Content-Type', contentType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=audit_logs.${query.exportFormat}`,
    );
    res.send(buffer);
  }
}
