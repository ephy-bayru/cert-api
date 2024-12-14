import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
} from 'class-validator';
import { DocumentStatus } from '../entities/document-status.enum';
import { DocumentType } from '../entities/document-type.enum';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentType)
  documentType: DocumentType;

  @IsOptional()
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsUUID()
  ownerId: string;

  @IsOptional()
  @IsString()
  metadata?: string;

  // Note: File will be handled separately in the controller
}
