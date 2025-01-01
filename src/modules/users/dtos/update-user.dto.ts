import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsEnum,
  IsDate,
  Length,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus } from '../entities/user-status.enum';
import { ProviderType } from '../enums/provider-types';
import { AddressDto } from './address.dto';
import { GlobalRole } from '@common/enums/global-role.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string.' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string.' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'Surname must be a string.' })
  surname?: string;

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
  @IsEnum(ProviderType, { message: 'Provider must be a valid type.' })
  provider?: ProviderType;

  @IsOptional()
  @IsEnum(UserStatus, { message: 'Status must be a valid user status.' })
  status?: UserStatus;

  @IsOptional()
  @IsDate({ message: 'Date of birth must be a valid date.' })
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsString({ message: 'Nationality must be a string.' })
  nationality?: string;

  @IsOptional()
  @IsIn(['male', 'female'], {
    message: 'Gender must be male, female.',
  })
  gender?: string;

  @IsOptional()
  @IsString({ message: 'FCN must be a string.' })
  @Length(16, 16, { message: 'FCN must be exactly 16 digits.' })
  @Matches(/^\d{16}$/, { message: 'FCN must contain only numbers.' })
  fcn?: string;

  @IsOptional()
  @IsString({ message: 'FIN must be a string.' })
  @Length(12, 12, { message: 'FIN must be exactly 12 digits.' })
  @Matches(/^\d{12}$/, { message: 'FIN must contain only numbers.' })
  fin?: string;

  @IsOptional()
  @IsEnum(GlobalRole, {
    message: 'Role must be a valid type (e.g., USER, ORGANIZATION, ADMIN).',
  })
  role?: GlobalRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
