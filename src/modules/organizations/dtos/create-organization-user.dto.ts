import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsUUID,
  IsObject,
  MaxLength,
  MinLength,
  IsPhoneNumber,
  Matches,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OrganizationUserPermissionsDto } from './organization-user-permissions.dto';
import { GlobalRole } from '@common/enums/global-role.enum';

export class CreateOrganizationUserDto {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  // Authentication Details
  @ApiProperty()
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  userName: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    },
  )
  password: string;

  // Personal Information
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  middleName?: string;

  @ApiPropertyOptional()
  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  profileImageUrl?: string;

  // Professional Information
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  employeeId?: string;

  // Role and Permissions
  @ApiProperty({ enum: GlobalRole })
  @IsEnum(GlobalRole)
  role: GlobalRole;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => OrganizationUserPermissionsDto)
  @IsOptional()
  permissions?: OrganizationUserPermissionsDto;

  // Preferences
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  preferences?: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };

  // Restrictions
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  restrictions?: {
    ipWhitelist?: string[];
    allowedTimeRanges?: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
    maxDailyVerifications?: number;
    documentTypeRestrictions?: string[];
  };
}
