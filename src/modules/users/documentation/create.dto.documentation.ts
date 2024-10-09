import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  IsDate,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../entities/user-role.entity';
import { UserStatus } from '../entities/user-status.entity';
import { ProviderType } from '../enums/provider-types';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username for the user',
  })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description:
      'Password for the user account. Must include uppercase, lowercase, number, and special character.',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    },
  )
  password: string;

  @ApiPropertyOptional({
    enum: ProviderType,
    example: ProviderType.Local,
    description: 'Authentication provider type',
  })
  @IsOptional()
  @IsEnum(ProviderType)
  provider?: ProviderType;

  @ApiPropertyOptional({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Role of the user',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Status of the user',
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    example: '1990-01-01',
    description: 'Date of birth of the user',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: '1234567890123456',
    description: 'FCN (16-digit number)',
  })
  @IsOptional()
  @IsString()
  @Length(16, 16)
  fcn?: string;

  @ApiPropertyOptional({
    example: '123456789012',
    description: 'FIN (12-digit number)',
  })
  @IsOptional()
  @IsString()
  @Length(12, 12)
  fin?: string;
}
