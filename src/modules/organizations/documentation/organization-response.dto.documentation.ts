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

  @ApiProperty({ enum: OrganizationStatus })
  status: OrganizationStatus;

  @ApiPropertyOptional()
  foundedDate?: Date;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiProperty()
  settings: {
    requireTwoFactorAuth?: boolean;
    allowExternalVerifiers?: boolean;
    documentRetentionDays?: number;
    autoArchiveEnabled?: boolean;
  };

  @ApiPropertyOptional()
  address?: AddressDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial: Partial<OrganizationResponseDto>) {
    Object.assign(this, partial);
  }
}
