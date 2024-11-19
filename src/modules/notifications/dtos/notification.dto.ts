import { NotificationPriority } from '../enums/notification-priority.enum';
import {
  NotificationContentType,
  NotificationType,
} from '../entities/notification-type.enum';
import { NotificationStatus } from '../entities/notification-status.enum';

export class NotificationDTO {
  id: string;
  type: NotificationType;
  contentType: NotificationContentType;
  message: string;
  subject?: string;
  actionUrl?: string;
  status: NotificationStatus;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  userId?: string;
  organizationId?: string;
  scheduledFor?: Date
}
