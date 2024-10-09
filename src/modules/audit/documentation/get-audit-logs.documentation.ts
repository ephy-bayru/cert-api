import { Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  IsString,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../enums/audit-action.enum';

export enum ExportFormat {
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel',
}

class SortOption {
  @ApiProperty({
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    description: 'Sort order',
  })
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';

  @ApiProperty({ example: 'performedAt', description: 'Field to sort by' })
  @IsString()
  field: string;
}

export class GetAuditLogsDto {
  @ApiPropertyOptional({
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25, description: 'Number of items per page' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 25;

  @ApiPropertyOptional({
    enum: AuditAction,
    isArray: true,
    description: 'Filter by specific audit actions',
  })
  @IsOptional()
  @IsEnum(AuditAction, { each: true })
  @IsArray()
  actions?: AuditAction[];

  @ApiPropertyOptional({
    isArray: true,
    example: ['User', 'Document'],
    description: 'Filter by entity types',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  entityTypes?: string[];

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by user who performed the action',
  })
  @IsOptional()
  @IsUUID()
  performedById?: string;

  @ApiPropertyOptional({
    example: '2023-04-15T00:00:00Z',
    description: 'Start date for filtering audit logs',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @ApiPropertyOptional({
    example: '2023-04-16T23:59:59Z',
    description: 'End date for filtering audit logs',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @ApiPropertyOptional({
    isArray: true,
    example: ['SUCCESS', 'FAILED'],
    description: 'Filter by action statuses',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  statuses?: string[];

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'Filter by IP address',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by entity ID',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    type: [SortOption],
    description: 'Sorting options for the query results',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortOption)
  @IsArray()
  sort?: SortOption[];

  @ApiPropertyOptional({
    example: 'profile update',
    description: 'Search term for full-text search across audit logs',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({
    default: false,
    description: 'Include metadata in the query results',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMetadata?: boolean = false;

  @ApiPropertyOptional({
    enum: ExportFormat,
    description: 'Format for exporting audit logs',
  })
  @IsOptional()
  @IsEnum(ExportFormat)
  exportFormat?: ExportFormat;
}
