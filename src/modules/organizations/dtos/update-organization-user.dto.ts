import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrganizationUserDto } from './create-organization-user.dto';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOrganizationUserDto extends PartialType(
  OmitType(CreateOrganizationUserDto, ['organizationId', 'password'] as const),
) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  newPassword?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  deactivationReason?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  twoFactorEnabled?: boolean;

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  roleExpiresAt?: Date;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  certifications?: {
    name: string;
    issuedAt: Date;
    expiresAt?: Date;
    issuedBy: string;
    documentUrl?: string;
  }[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  updateReason?: string;
}
