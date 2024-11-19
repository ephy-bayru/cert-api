import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '../entities/document-status.enum';

export class UploadDocumentDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @MaxLength(100)
  documentType: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus = DocumentStatus.DRAFT;

  @IsUUID()
  uploaderId: string;

  @IsOptional()
  @IsUUID()
  uploadingOrganizationId?: string;

  @ValidateIf((o) => o.uploadingOrganizationId)
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  usersWithAccess?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  organizationsWithAccess?: string[];

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string to be parsed

  // The actual file will be handled separately in the controller
}
