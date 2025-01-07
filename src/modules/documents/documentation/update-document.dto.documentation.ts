import { IsString, IsOptional, IsArray, IsEnum, IsDate } from 'class-validator';
import { DocumentStatus } from '../entities/document-status.enum';
import { DocumentType } from '../entities/document-type.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDocumentDto {
  @ApiPropertyOptional({ description: 'Title of the document' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Type of the document',
    enum: DocumentType,
  })
  @IsOptional()
  @IsEnum(DocumentType)
  documentType?: DocumentType;

  @ApiPropertyOptional({
    description: 'Expiry date of the document',
    type: String,
    format: 'date-time',
  })
  @IsOptional()
  @IsDate()
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
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @ApiPropertyOptional({ description: 'Additional metadata for the document' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
