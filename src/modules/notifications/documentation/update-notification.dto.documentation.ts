import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsUrl, IsObject } from 'class-validator';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { NotificationStatus } from '../entities/notification-status.enum';

export class UpdateNotificationDto {
  @ApiPropertyOptional({
    example: 'Updated notification message',
    description: 'New message content for the notification',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/updated-action',
    description: 'Updated URL for any action associated with the notification',
  })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiPropertyOptional({
    enum: NotificationStatus,
    example: NotificationStatus.READ,
    description: 'Updated status of the notification',
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    example: NotificationPriority.HIGH,
    description: 'Updated priority level of the notification',
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    example: { updatedField: 'newValue' },
    description: 'Updated additional metadata for the notification',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
