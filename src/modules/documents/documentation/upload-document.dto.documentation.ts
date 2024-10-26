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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Title of the document', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of the document', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  documentType: string;

  @ApiPropertyOptional({
    description: 'Expiry date of the document',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'Tags associated with the document',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Status of the document',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus = DocumentStatus.DRAFT;

  @ApiProperty({ description: 'ID of the uploader', format: 'uuid' })
  @IsUUID()
  uploaderId: string;

  @ApiPropertyOptional({
    description: 'ID of the uploading organization',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  uploadingOrganizationId?: string;

  @ApiPropertyOptional({
    description: 'ID of the owner of the document',
    format: 'uuid',
  })
  @ValidateIf((o) => o.uploadingOrganizationId)
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({
    description: 'User IDs with access to the document',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  usersWithAccess?: string[];

  @ApiPropertyOptional({
    description: 'Organization IDs with access to the document',
    type: [String],
    format: 'uuid',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  organizationsWithAccess?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata for the document' })
  @IsOptional()
  @IsString()
  metadata?: string;

}
