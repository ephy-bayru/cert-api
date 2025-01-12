import { IsString, IsOptional, IsArray, IsEnum, IsDate } from 'class-validator';
import { DocumentStatus } from '../entities/document-status.enum';
import { DocumentType } from '../entities/document-type.enum';

export class UpdateDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @IsOptional()
  @IsDate()
  expiryDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsString()
  metadata?: string;
}
