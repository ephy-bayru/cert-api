import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { UserRole } from '../entities/user-role.entity';
import { UserStatus } from '../entities/user-status.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'User name must be a string.' })
  userName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Password must be a string.' })
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    },
  )
  password?: string;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string.' })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(UserRole, {
    message: 'Role must be a valid type (e.g., USER, ORGANIZATION, ADMIN).',
  })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
