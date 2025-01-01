import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../entities/user-status.enum';
import { ProviderType } from '../enums/provider-types';
import { GlobalRole } from '@common/enums/global-role.enum';

export class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({ example: 'John', description: 'First name of the user' })
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  lastName: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Unique username of the user',
  })
  userName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the user',
  })
  email: string;

  @ApiProperty({
    enum: GlobalRole,
    example: GlobalRole.END_USER,
    description: 'Role of the user',
  })
  role: GlobalRole;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Current status of the user',
  })
  status: UserStatus;

  @ApiProperty({
    enum: ProviderType,
    example: ProviderType.local,
    description: 'Authentication provider type',
  })
  provider: ProviderType;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth of the user',
  })
  dateOfBirth?: Date;

  @ApiProperty({
    example: '1234567890123456',
    description: 'FCN (16-digit number)',
  })
  fcn?: string;

  @ApiProperty({
    example: '123456789012',
    description: 'FIN (12-digit number)',
  })
  fin?: string;

  @ApiProperty({
    example: '2023-06-15T10:00:00Z',
    description: 'Date and time when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2023-06-15T10:00:00Z',
    description: 'Date and time when the user was last updated',
  })
  updatedAt: Date;
}
