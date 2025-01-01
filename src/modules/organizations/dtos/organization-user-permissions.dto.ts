import {
  IsBoolean,
  IsOptional,
  IsArray,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationUserPermissionsDto {
  @ApiPropertyOptional({
    description: 'Can verify documents',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  canVerifyDocuments?: boolean;

  @ApiPropertyOptional({
    description: 'Can manage users',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  canManageUsers?: boolean;

  @ApiPropertyOptional({
    description: 'Can access documents',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  canAccessDocuments?: boolean;

  @ApiPropertyOptional({
    description: 'Can manage settings',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  canManageSettings?: boolean;

  @ApiPropertyOptional({
    description: 'Types of documents they can verify',
    example: ['BUSINESS', 'LEGAL'],
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  documentTypes?: string[];

  @ApiPropertyOptional({
    description: 'Daily verification limit',
    example: 100,
  })
  @IsOptional()
  verificationLimit?: number;
}
