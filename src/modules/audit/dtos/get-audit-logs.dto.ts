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
  @ApiProperty({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsEnum(['ASC', 'DESC'])
  order: 'ASC' | 'DESC';

  @ApiProperty({ example: 'performedAt' })
  @IsString()
  field: string;
}

export class GetAuditLogsDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, default: 25 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 25;

  @ApiProperty({ required: false, enum: AuditAction, isArray: true })
  @IsOptional()
  @IsEnum(AuditAction, { each: true })
  @IsArray()
  actions?: AuditAction[];

  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  entityTypes?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  performedById?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  endDate?: Date;

  @ApiProperty({ required: false, isArray: true })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  statuses?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({ required: false, type: [SortOption] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortOption)
  @IsArray()
  sort?: SortOption[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeMetadata?: boolean = false;

  @ApiProperty({
    required: false,
    enum: ['csv', 'json', false],
    default: false,
  })
  @ApiPropertyOptional({ enum: ExportFormat })
  @IsOptional()
  @IsEnum(ExportFormat)
  exportFormat?: ExportFormat;
}
