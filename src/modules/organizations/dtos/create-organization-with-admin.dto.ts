import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, ValidateNested, IsOptional } from 'class-validator';
import { CreateOrganizationDto } from './create-organization.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrganizationUserPermissionsDto } from './organization-user-permissions.dto';

export class CreateOrganizationWithAdminDto extends CreateOrganizationDto {
  @ApiProperty({
    description: 'Admin user email address',
    example: 'admin@acme.com',
  })
  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @ApiProperty({
    description: 'Admin user password',
    example: 'StrongP@ssw0rd123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @IsNotEmpty()
  adminPassword: string;

  @ApiPropertyOptional({
    description: 'Admin user first name',
    example: 'Alice',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  adminFirstName?: string;

  @ApiPropertyOptional({
    description: 'Admin user last name',
    example: 'Smith',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  adminLastName?: string;

  @ApiPropertyOptional({
    description: 'Admin user phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  adminPhoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Admin user preferences',
    example: {
      emailNotifications: true,
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationUserPermissionsDto)
  adminPreferences?: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
}
