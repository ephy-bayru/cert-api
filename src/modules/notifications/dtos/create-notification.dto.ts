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
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  message: string;

  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @IsEnum(NotificationPriority)
  priority: NotificationPriority;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
