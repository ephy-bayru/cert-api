import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AddressDto } from '@modules/users/dtos/address.dto';
import { OrganizationStatus } from '../entities/organization-status.enum';

export class OrganizationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  contactEmail: string;

  @ApiProperty()
  contactPhoneNumber: string;

  @ApiPropertyOptional()
  industry?: string;

  @ApiPropertyOptional()
  foundedDate?: Date;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiProperty({ enum: OrganizationStatus })
  status: OrganizationStatus;

  @ApiPropertyOptional()
  verifiedAt?: Date;

  @ApiPropertyOptional()
  @Type(() => AddressDto)
  address?: AddressDto;

  @ApiPropertyOptional()
  complianceInfo?: {
    taxId?: string;
    registrationNumber?: string;
    licenses?: string[];
    certifications?: string[];
  };

  @ApiProperty()
  settings: {
    requireTwoFactorAuth: boolean;
    allowExternalVerifiers: boolean;
    documentRetentionDays: number;
    autoArchiveEnabled: boolean;
  };

  @ApiPropertyOptional()
  blockchainMetadata?: {
    network: string;
    contractAddress?: string;
    lastSyncedBlock?: number;
  };

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @Expose()
  get isVerified(): boolean {
    return this.status === OrganizationStatus.VERIFIED;
  }

  @Expose()
  get verificationAge(): number | null {
    if (!this.verifiedAt) return null;
    return Math.floor(
      (Date.now() - this.verifiedAt.getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  // Exclude sensitive data
  @Exclude()
  blockchainAddress: string;

  @Exclude()
  version: number;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  deletedBy?: string;

  constructor(partial: Partial<OrganizationResponseDto>) {
    Object.assign(this, partial);
  }
}
