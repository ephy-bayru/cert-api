import { GlobalRole } from '@common/enums/global-role.enum';
import {
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  Length,
  IsArray,
} from 'class-validator';

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
  @Length(1, 100, { message: 'Username must be less than 100 characters' })
  userName?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'Invalid phone number' })
  phoneNumber?: string;

  @IsOptional()
  @IsEnum(GlobalRole, { each: true })
  @IsArray()
  roles: GlobalRole[]; 
}
