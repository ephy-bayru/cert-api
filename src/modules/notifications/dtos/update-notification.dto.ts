import { IsEnum, IsString, IsOptional, IsUrl, IsObject } from 'class-validator';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { NotificationStatus } from '../entities/notification-status.enum';

export class UpdateNotificationDto {
  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
