import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  IsEnum,
  ValidateIf,
} from 'class-validator';
import { ProviderType } from '../enums/provider-types';
import { UserStatus } from '../entities/user-status.entity';

export class CreateUserDto {
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name is required.' })
  firstName: string;

  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  lastName: string;

  @IsString({ message: 'User name must be a string.' })
  @IsNotEmpty({ message: 'User name is required.' })
  userName: string;

  @IsNotEmpty({ message: 'Email address is required.' })
  @IsEmail({}, { message: 'Email address must be valid.' })
  email: string;

  @ValidateIf((o) => o.provider === ProviderType.Local)
  @IsNotEmpty({ message: 'Password is required for local accounts.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    },
  )
  password?: string;

  @IsOptional()
  @IsEnum(ProviderType, {
    message:
      'Provider must be a valid type (e.g., local, google, facebook, twitter, microsoft).',
  })
  provider: ProviderType = ProviderType.Local;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString({ message: 'Phone number must be a string.' })
  phoneNumber?: string;
}
