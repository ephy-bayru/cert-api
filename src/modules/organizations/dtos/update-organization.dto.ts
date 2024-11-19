import {
  IsString,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateOrganizationDto } from './create-organization.dto';

export class UpdateOrganizationDto extends PartialType(
  OmitType(CreateOrganizationDto, ['blockchainAddress'] as const),
) {
  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  statusChangeReason?: string;

  @ApiPropertyOptional({
    description: 'Reference to supporting documents for changes',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  changeReference?: string;

  @ApiPropertyOptional({
    description: 'Updated compliance verification documents',
  })
  @IsObject()
  @IsOptional()
  verificationDocuments?: {
    documentType: string;
    documentUrl: string;
    expiryDate?: Date;
  }[];
}
