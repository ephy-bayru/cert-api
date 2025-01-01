import { GlobalRole } from '@common/enums/global-role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  Length,
  IsPhoneNumber,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateAdminUserDto {
  @ApiProperty({
    description: 'Unique email address of the admin user',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'Password for the admin user account',
    minLength: 8,
    maxLength: 128,
    example: 'StrongP@ssw0rd',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @Length(8, 128, {
    message: 'Password must be between 8 and 128 characters',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'First name of the admin user',
    maxLength: 100,
    example: 'John',
  })
  @IsOptional()
  @MaxLength(100, {
    message: 'First name must be less than or equal to 100 characters',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the admin user',
    maxLength: 100,
    example: 'Doe',
  })
  @IsOptional()
  @MaxLength(100, {
    message: 'Last name must be less than or equal to 100 characters',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the admin user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Role assigned to the admin user',
    enum: GlobalRole,
    example: GlobalRole.PLATFORM_ADMIN,
  })
  @IsOptional()
  @IsEnum(GlobalRole, { message: 'Role must be a valid AdminRole' })
  role?: GlobalRole;
}

export class UpdateAdminUserDto {
  @ApiPropertyOptional({
    description: 'Unique email address of the admin user',
    example: 'admin@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'New password for the admin user account',
    minLength: 8,
    maxLength: 128,
    example: 'NewStr0ngP@ssw0rd',
  })
  @IsOptional()
  @Length(8, 128, {
    message: 'Password must be between 8 and 128 characters',
  })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'First name of the admin user',
    maxLength: 100,
    example: 'Jane',
  })
  @IsOptional()
  @MaxLength(100, {
    message: 'First name must be less than or equal to 100 characters',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the admin user',
    maxLength: 100,
    example: 'Smith',
  })
  @IsOptional()
  @MaxLength(100, {
    message: 'Last name must be less than or equal to 100 characters',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the admin user',
    example: '+1234567890',
  })
  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Phone number must be a valid phone number',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Role assigned to the admin user',
    enum: GlobalRole,
    example: GlobalRole.SUPPORT,
  })
  @IsOptional()
  @IsEnum(GlobalRole, { message: 'Role must be a valid AdminRole' })
  role?: GlobalRole;
}
