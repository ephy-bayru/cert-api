import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
} from 'class-validator';
import { DocumentStatus } from '../entities/document-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ description: 'Title of the document' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Type of the document' })
  @IsString()
  documentType: string;

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

  @ApiProperty({ description: 'Status of the document', enum: DocumentStatus })
  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @ApiProperty({
    description: 'ID of the owner of the document',
    format: 'uuid',
  })
  @IsUUID()
  ownerId: string;

  @ApiPropertyOptional({ description: 'Additional metadata for the document' })
  @IsOptional()
  @IsString()
  metadata?: string;

}
