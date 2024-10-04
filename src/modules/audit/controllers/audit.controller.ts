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
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuditLogService } from '../services/audit-log.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/entities/user-role.entity';
import { AuditLog } from '../entities/audit-log.entity';
import { GetAuditLogsDto } from '../dtos/get-audit-logs.dto';
import { CreateAuditLogDto } from '../dtos/create-audit-logs.dto';
import { PaginationResult } from 'src/common/interfaces/IPagination';

@ApiTags('Audit Logs')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Return all audit logs.',
    type: [AuditLog],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAuditLogs(
    @Query() query: GetAuditLogsDto,
  ): Promise<PaginationResult<AuditLog>> {
    return this.auditLogService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a specific audit log' })
  @ApiResponse({
    status: 200,
    description: 'Return the audit log.',
    type: AuditLog,
  })
  @ApiResponse({ status: 404, description: 'Audit log not found.' })
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
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new audit log' })
  @ApiResponse({
    status: 201,
    description: 'The audit log has been successfully created.',
    type: AuditLog,
  })
  async createAuditLog(
    @Body() createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLog> {
    return this.auditLogService.createLog(createAuditLogDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an audit log' })
  @ApiResponse({
    status: 200,
    description: 'The audit log has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Audit log not found.' })
  async deleteAuditLog(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.auditLogService.delete(id);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit log statistics' })
  @ApiResponse({ status: 200, description: 'Return audit log statistics.' })
  async getAuditLogStatistics(): Promise<any> {
    return this.auditLogService.getStatistics();
  }

  @Get('export')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Return exported audit logs.' })
  @ApiQuery({ name: 'format', enum: ['csv', 'json', 'excel'] })
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
