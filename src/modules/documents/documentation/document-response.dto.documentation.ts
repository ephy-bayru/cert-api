import { Exclude, Expose, Type } from 'class-transformer';
import { DocumentStatus } from '../entities/document-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Exclude()
export class DocumentResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the document',
    format: 'uuid',
  })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Title of the document' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ description: 'Description of the document' })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Type of the document' })
  @Expose()
  documentType: string;

  @ApiProperty({ description: 'File type of the document' })
  @Expose()
  fileType: string;

  @ApiProperty({ description: 'Size of the file in bytes' })
  @Expose()
  fileSize: number;

  @ApiPropertyOptional({
    description: 'Expiry date of the document',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  expiryDate?: Date;

  @ApiPropertyOptional({
    description: 'Tags associated with the document',
    type: [String],
  })
  @Expose()
  tags?: string[];

  @ApiProperty({ description: 'Status of the document', enum: DocumentStatus })
  @Expose()
  status: DocumentStatus;

  @ApiProperty({
    description: 'ID of the owner of the document',
    format: 'uuid',
  })
  @Expose()
  ownerId: string;

  @ApiProperty({
    description: 'Date when the document was created',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the document was last updated',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Date when the document was last verified',
    type: String,
    format: 'date-time',
  })
  @Expose()
  @Type(() => Date)
  lastVerifiedAt?: Date;

  @ApiPropertyOptional({
    description: 'Blockchain transaction hash associated with the document',
  })
  @Expose()
  blockchainTxHash?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata of the document',
    type: 'object',
  })
  @Expose()
  metadata?: Record<string, any>;

  constructor(partial: Partial<DocumentResponseDto>) {
    Object.assign(this, partial);
  }
}
