import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  IsDate,
  Length,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '../entities/user-status.enum';
import { GlobalRole } from '@common/enums/global-role.enum';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'John',
    description: 'First name of the user',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe', description: 'Last name of the user' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    example: 'johndoe',
    description: 'Unique username for the user',
  })
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description:
      'New password for the user account. Must include uppercase, lowercase, number, and special character.',
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    },
  )
  password?: string;

  @ApiPropertyOptional({
    enum: GlobalRole,
    example: GlobalRole.END_USER,
    description: 'Role of the user',
  })
  @IsOptional()
  @IsEnum(GlobalRole)
  role?: GlobalRole;

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
