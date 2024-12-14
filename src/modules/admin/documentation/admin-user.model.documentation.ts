import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '../entities/admin-user.entity';

export class AdminUserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the admin user',
    example: 'e8b5e77c-3c8f-4f5e-9b1a-3e6d7a9b5a4f',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the admin user',
    example: 'admin@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the admin user',
    example: 'John',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Last name of the admin user',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Phone number of the admin user',
    example: '+1234567890',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    description: 'Role assigned to the admin user',
    enum: AdminRole,
    example: AdminRole.ADMIN,
  })
  role: AdminRole;

  @ApiProperty({
    description: 'Indicates whether the admin user is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Indicates whether the admin user account is locked',
    example: false,
  })
  isLocked: boolean;

  @ApiProperty({
    description: 'Date when the admin user was created',
    example: '2024-01-01T00:00:00.000Z',
    type: 'string',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the admin user was last updated',
    example: '2024-01-02T12:34:56.000Z',
    type: 'string',
    format: 'date-time',
  })
  updatedAt: Date;
}
