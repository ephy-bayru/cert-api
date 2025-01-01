import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsIn,
  IsOptional,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Type of user. One of: admin, org/organization, user',
    enum: ['admin', 'org', 'organization', 'user'],
    example: 'admin',
  })
  @IsIn(['admin', 'org', 'organization', 'user'], {
    message: 'Invalid user type',
  })
  type: string;

  @ApiProperty({
    description: 'User email address',
    example: 'admin@example.com',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Str0ngPass@123',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiPropertyOptional({
    description: '2FA code if enabled',
    example: '123456',
  })
  @IsOptional()
  @IsString()
  code?: string;
}
