import {
  IsString,
  IsEmail,
  IsOptional,
  IsUrl,
  IsDate,
  Matches,
  ValidateNested,
  IsEnum,
  IsObject,
  MaxLength,
  MinLength,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '@modules/users/dtos/address.dto';
import { OrganizationStatus } from '../entities/organization-status.enum';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Name of the organization',
    example: 'Acme Corp',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Organization contact email' })
  @IsEmail()
  @IsOptional()
  @MaxLength(150)
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Organization contact phone number' })
  @IsPhoneNumber()
  @IsOptional()
  @MaxLength(20)
  contactPhoneNumber?: string;

  @ApiPropertyOptional({ description: 'Industry sector of the organization' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  industry?: string;

  @ApiPropertyOptional({ description: 'Date when organization was founded' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  foundedDate?: Date;

  @ApiPropertyOptional({
    description: 'Detailed description of the organization',
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ description: 'Organization website URL' })
  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ description: 'URL of organization logo' })
  @IsUrl()
  @IsOptional()
  @MaxLength(255)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Initial status of the organization' })
  @IsEnum(OrganizationStatus)
  @IsOptional()
  status?: OrganizationStatus = OrganizationStatus.PENDING_APPROVAL;

  @ApiPropertyOptional({ description: 'Organization compliance information' })
  @IsObject()
  @IsOptional()
  complianceInfo?: {
    taxId?: string;
    registrationNumber?: string;
    licenses?: string[];
    certifications?: string[];
  };

  @ApiPropertyOptional({ description: 'Organization settings' })
  @IsObject()
  @IsOptional()
  settings?: {
    requireTwoFactorAuth?: boolean;
    allowExternalVerifiers?: boolean;
    documentRetentionDays?: number;
    autoArchiveEnabled?: boolean;
  };

  @ApiPropertyOptional({ description: 'Blockchain wallet address' })
  @IsString()
  @IsOptional()
  @Matches(/^0x[a-fA-F0-9]{40}$/, {
    message: 'Invalid Ethereum address format',
  })
  blockchainAddress?: string;

  @ApiPropertyOptional({ description: 'Physical address of the organization' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
