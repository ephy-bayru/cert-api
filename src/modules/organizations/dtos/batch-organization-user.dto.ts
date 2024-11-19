import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  ArrayMinSize,
  ArrayMaxSize,
  IsEmail,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationUserRole } from '../entities/organization-user-role.enum';

// DTO for batch creating users
class BatchCreateUserItem {
  @ApiProperty({ description: 'Email address for the new user' })
  @IsEmail()
  @MaxLength(150)
  email: string;

  @ApiProperty({ description: 'Username for the new user' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  userName: string;

  @ApiProperty({ description: 'First name of the user' })
  @IsString()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsString()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    enum: OrganizationUserRole,
    description: 'Role to assign to the user',
  })
  @IsEnum(OrganizationUserRole)
  role: OrganizationUserRole;

  @ApiPropertyOptional({ description: 'Department the user belongs to' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({ description: 'Job title of the user' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;
}

export class BatchCreateOrganizationUsersDto {
  @ApiProperty({
    type: [BatchCreateUserItem],
    description: 'Array of users to create',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BatchCreateUserItem)
  users: BatchCreateUserItem[];

  @ApiProperty({ description: 'Organization ID where users will be created' })
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    description: 'Default password for all created users',
  })
  @IsString()
  @IsOptional()
  @MinLength(8)
  defaultPassword?: string;

  @ApiPropertyOptional({
    description: 'Whether to send welcome emails to created users',
  })
  @IsBoolean()
  @IsOptional()
  sendWelcomeEmail?: boolean = true;
}

// DTO for batch updating user roles
class BatchUpdateRoleItem {
  @ApiProperty({ description: 'ID of the organization user to update' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    enum: OrganizationUserRole,
    description: 'New role to assign',
  })
  @IsEnum(OrganizationUserRole)
  newRole: OrganizationUserRole;
}

export class BatchUpdateOrganizationUserRolesDto {
  @ApiProperty({
    type: [BatchUpdateRoleItem],
    description: 'Array of role updates to process',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BatchUpdateRoleItem)
  updates: BatchUpdateRoleItem[];

  @ApiPropertyOptional({ description: 'Reason for the batch role update' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

// DTO for batch activation/deactivation
class BatchStatusUpdateItem {
  @ApiProperty({ description: 'ID of the organization user' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Whether to activate or deactivate the user' })
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;
}

export class BatchUpdateOrganizationUserStatusDto {
  @ApiProperty({
    type: [BatchStatusUpdateItem],
    description: 'Array of status updates to process',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => BatchStatusUpdateItem)
  updates: BatchStatusUpdateItem[];
}

// DTO for batch delete
export class BatchDeleteOrganizationUsersDto {
  @ApiProperty({
    description: 'Array of user IDs to delete',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  userIds: string[];

  @ApiPropertyOptional({ description: 'Reason for batch deletion' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: 'Whether to perform soft delete' })
  @IsBoolean()
  @IsOptional()
  softDelete?: boolean = true;
}

// Response DTO for batch operations
export class BatchOperationResponseDto {
  @ApiProperty({ description: 'Number of successful operations' })
  successCount: number;

  @ApiProperty({ description: 'Number of failed operations' })
  failureCount: number;

  @ApiProperty({ description: 'Array of successfully processed user IDs' })
  successfulIds: string[];

  @ApiProperty({
    description: 'Details of failed operations',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  errors: Record<string, string>;

  constructor(partial: Partial<BatchOperationResponseDto>) {
    Object.assign(this, partial);
  }
}
