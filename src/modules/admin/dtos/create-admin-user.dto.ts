import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  Length,
} from 'class-validator';
import { AdminRole } from '../entities/admin-user.entity';

export class CreateAdminUserDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 128, { message: 'Password must be between 8 and 128 characters' })
  password: string;

  @IsOptional()
  @Length(1, 100, { message: 'First name must be less than 100 characters' })
  firstName?: string;

  @IsOptional()
  @Length(1, 100, { message: 'Last name must be less than 100 characters' })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(AdminRole, { message: 'Invalid role' })
  role?: AdminRole;
}
