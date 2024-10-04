import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsIP,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction } from '../enums/audit-action.enum';

class MetadataDto {
  [key: string]: any;
}

export class CreateAuditLogDto {
  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @IsNotEmpty()
  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsUUID()
  performedById?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}
