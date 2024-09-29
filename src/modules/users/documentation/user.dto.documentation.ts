import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @IsString({ message: 'First name must be a string.' })
  @IsNotEmpty({ message: 'First name is required.' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @IsString({ message: 'Last name must be a string.' })
  @IsNotEmpty({ message: 'Last name is required.' })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user, must be unique and valid',
  })
  @IsEmail({}, { message: 'Email address must be valid.' })
  @IsNotEmpty({ message: 'Email address is required.' })
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Password with at least 8 characters, including an uppercase letter, a lowercase letter, a number, and a special character',
  })
  @IsNotEmpty({ message: 'Password is required.' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).',
    },
  )
  password: string;

  @ApiProperty({
    example: 'auth0|1234567890',
    required: false,
    description: 'Auth0 ID of the user, optional',
  })
  @IsOptional()
  @IsString({ message: 'Auth0 ID must be a string.' })
  auth0Id?: string;
}
