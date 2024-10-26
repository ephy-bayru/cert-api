import { Exclude, Expose, Type } from 'class-transformer';
import { DocumentStatus } from '../entities/document-status.enum';

@Exclude()
export class DocumentResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description?: string;

  @Expose()
  documentType: string;

  @Expose()
  fileType: string;

  @Expose()
  fileSize: number;

  @Expose()
  expiryDate?: Date;

  @Expose()
  tags?: string[];

  @Expose()
  status: DocumentStatus;

  @Expose()
  ownerId: string;

  @Expose()
  @Type(() => Date)
  createdAt: Date;

  @Expose()
  @Type(() => Date)
  updatedAt: Date;

  @Expose()
  @Type(() => Date)
  lastVerifiedAt?: Date;

  @Expose()
  blockchainTxHash?: string;

  @Expose()
  metadata?: Record<string, any>;

  constructor(partial: Partial<DocumentResponseDto>) {
    Object.assign(this, partial);
  }
}
