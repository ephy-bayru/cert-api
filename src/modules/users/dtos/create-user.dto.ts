import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  IsDate,
  Length,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProviderType } from '../enums/provider-types';
import { UserStatus } from '../entities/user-status.entity';
import { AddressDto } from './address.dto';
import { UserRole } from '../entities/user-role.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  surname?: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password?: string;

  @IsOptional()
  @IsEnum(ProviderType)
  provider?: ProviderType;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsIn(['male', 'female', 'other'])
  sex?: string;

  @IsOptional()
  @IsString()
  @Length(16, 16, { message: 'FCN must be exactly 16 digits' })
  @Matches(/^\d{16}$/, { message: 'FCN must contain only numbers' })
  fcn?: string;

  @IsOptional()
  @IsString()
  @Length(12, 12, { message: 'FIN must be exactly 12 digits' })
  @Matches(/^\d{12}$/, { message: 'FIN must contain only numbers' })
  fin?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}
