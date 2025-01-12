import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDate,
  IsUUID,
  MaxLength,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentStatus } from '../entities/document-status.enum';
import { AtLeastOneOwnershipValidator } from '../validations/at-least-one-ownership.validator';

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

  // The user physically uploading the doc
  @IsUUID()
  uploaderId: string;

  // Organization ownership
  @IsOptional()
  @IsUUID()
  uploadingOrganizationId?: string;

  // If we are providing an owner user
  @IsOptional()
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
  metadata?: string;

  // Use the custom class validator to ensure at least one ownership field
  @Validate(AtLeastOneOwnershipValidator)
  dummyFieldForValidation?: boolean;
}
