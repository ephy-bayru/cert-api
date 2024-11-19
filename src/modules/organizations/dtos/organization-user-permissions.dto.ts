import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationUserPermissionsDto {
  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canVerifyDocuments?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageUsers?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  canAccessDocuments?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  canManageSettings?: boolean;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  documentTypes?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  verificationLimit?: number;
}
