import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsIP,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '../enums/audit-action.enum';

export class CreateAuditLogDto {
  @ApiProperty({
    enum: AuditAction,
    example: AuditAction.APPROVE_USER,
    description: 'The action performed in this audit log',
  })
  @IsNotEmpty()
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({
    example: 'User',
    description: 'The type of entity this audit log is about',
  })
  @IsNotEmpty()
  @IsString()
  entityType: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the entity this audit log is about',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who performed the action',
  })
  @IsOptional()
  @IsUUID()
  performedById?: string;

  @ApiPropertyOptional({
    example: {
      oldValue: { status: 'PENDING' },
      newValue: { status: 'APPROVED' },
      reason: 'Document verified',
      additionalInfo: { verifier: 'John Doe' },
    },
    description: 'Additional metadata about the audit log',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'The IP address from which the action was performed',
  })
  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @ApiPropertyOptional({
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    description: 'The user agent of the client that performed the action',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    example: 'SUCCESS',
    description: 'The status of the action',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    example: 'User profile updated with new email address',
    description: 'Additional details about the action',
  })
  @IsOptional()
  @IsString()
  details?: string;

  @ApiPropertyOptional({
    example: { documentId: '123e4567-e89b-12d3-a456-426614174000', version: 2 },
    description: 'Any additional data related to the audit log',
  })
  @IsOptional()
  @IsObject()
  additionalData?: Record<string, any>;
}
