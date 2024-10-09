import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  IsUrl,
  IsUUID,
  IsObject,
} from 'class-validator';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { NotificationType } from '../entities/notification-type.enum';

export class CreateNotificationDto {
  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.PUSH,
    description: 'Type of the notification',
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    example: 'Your document has been verified',
    description: 'Message content of the notification',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    example: 'https://example.com/document/123',
    description: 'URL for any action associated with the notification',
  })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiProperty({
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    description: 'Priority level of the notification',
  })
  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @ApiPropertyOptional({
    example: { documentId: '123', verifierId: '456' },
    description: 'Additional metadata for the notification',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the user to receive the notification',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'ID of the organization to receive the notification',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
