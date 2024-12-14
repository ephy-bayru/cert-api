import { Injectable } from '@nestjs/common';
import {
  NotificationType,
  NotificationContentType,
} from './entities/notification-type.enum';
import { NotificationPriority } from './enums/notification-priority.enum';
import { NotificationFactory } from './notifications.factory';
import { NotificationDTO } from './dtos/notification.dto';

@Injectable()
export class NotificationHandler {
  constructor(private readonly notificationFactory: NotificationFactory) {}

  handleAccountVerification(
    recipientId: string,
    username: string,
    verificationLink: string,
  ): NotificationDTO {
    return this.notificationFactory.create(
      NotificationType.EMAIL,
      NotificationContentType.EMAIL_VERIFICATION,
      recipientId,
      { username, verificationLink },
      NotificationPriority.HIGH,
    );
  }

  handleDocumentStatusChange(
    recipientId: string,
    username: string,
    documentTitle: string,
    newStatus: string,
    updateDate: string,
    updatedBy: string,
    documentLink: string,
  ): NotificationDTO {
    return this.notificationFactory.create(
      NotificationType.EMAIL,
      NotificationContentType.DOCUMENT_STATUS_UPDATED,
      recipientId,
      {
        username,
        documentTitle,
        newStatus,
        updateDate,
        updatedBy,
        documentLink,
      },
    );
  }

  handleNewUserRegistration(
    recipientId: string,
    username: string,
    email: string,
    registrationDate: string,
    adminDashboardLink: string,
  ): NotificationDTO {
    return this.notificationFactory.create(
      NotificationType.EMAIL,
      NotificationContentType.NEW_USER_REGISTRATION,
      recipientId,
      { username, email, registrationDate, adminDashboardLink },
    );
  }

  handlePasswordReset(
    recipientId: string,
    username: string,
    resetLink: string,
  ): NotificationDTO {
    return this.notificationFactory.create(
      NotificationType.EMAIL,
      NotificationContentType.PASSWORD_RESET_REQUEST,
      recipientId,
      { username, resetLink },
      NotificationPriority.HIGH,
    );
  }

  handleCustomNotification(
    type: NotificationType,
    contentType: NotificationContentType,
    recipientId: string,
    data: any,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ): NotificationDTO {
    return this.notificationFactory.create(
      type,
      contentType,
      recipientId,
      data,
      priority,
    );
  }
}
