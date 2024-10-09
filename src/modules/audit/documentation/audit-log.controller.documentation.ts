import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuditLog } from '../entities/audit-log.entity';
import { ExportFormat } from '../dtos/get-audit-logs.dto';

export function GetAuditLogsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all audit logs',
      description: 'Retrieves a paginated list of all audit logs',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved audit logs',
      type: AuditLog,
      isArray: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: Number,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: Number,
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: Date,
      description: 'Start date for filtering',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: Date,
      description: 'End date for filtering',
    }),
  );
}

export function GetAuditLogByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get a specific audit log',
      description: 'Retrieves a specific audit log by its ID',
    }),
    ApiParam({ name: 'id', type: 'string', description: 'Audit log ID' }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved the audit log',
      type: AuditLog,
    }),
    ApiResponse({ status: 404, description: 'Audit log not found' }),
  );
}

export function CreateAuditLogDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new audit log',
      description: 'Creates a new audit log entry',
    }),
    ApiResponse({
      status: 201,
      description: 'The audit log has been successfully created',
      type: AuditLog,
    }),
  );
}

export function DeleteAuditLogDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an audit log',
      description: 'Deletes a specific audit log by its ID',
    }),
    ApiParam({ name: 'id', type: 'string', description: 'Audit log ID' }),
    ApiResponse({
      status: 204,
      description: 'The audit log has been successfully deleted',
    }),
    ApiResponse({ status: 404, description: 'Audit log not found' }),
  );
}

export function GetAuditLogStatisticsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get audit log statistics',
      description: 'Retrieves statistics about audit logs',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully retrieved audit log statistics',
      // Consider creating a specific DTO for statistics response
      // type: AuditLogStatisticsDto
    }),
  );
}

export function ExportAuditLogsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Export audit logs',
      description: 'Exports audit logs in the specified format',
    }),
    ApiResponse({
      status: 200,
      description: 'Successfully exported audit logs',
    }),
    ApiQuery({
      name: 'format',
      enum: ExportFormat,
      description: 'Export format',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      type: Date,
      description: 'Start date for filtering',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      type: Date,
      description: 'End date for filtering',
    }),
  );
}
