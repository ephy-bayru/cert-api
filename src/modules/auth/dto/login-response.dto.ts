import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDetailsDto {
  @ApiProperty({ description: 'Unique ID of the user' })
  id: string;

  @ApiProperty({ description: 'Username of the user' })
  userName: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Concatenated full name of the user' })
  fullName: string;

  @ApiProperty({
    description: 'Roles of the user (e.g., ADMIN, SUPER_ADMIN, VERIFIER, etc.)',
    type: [String],
  })
  roles: string[];

  @ApiPropertyOptional({
    description: 'Organization ID if user belongs to an org',
  })
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Any additional info relevant to the user',
  })
  additionalInfo?: Record<string, any>;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'The JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR... (JWT token)',
  })
  access_token: string;

  @ApiProperty({ description: 'Details about the authenticated user' })
  user: UserDetailsDto;
}
