import { Injectable } from '@nestjs/common';
import { EmailTemplateService } from './services/email-template.service';
import {
  NotificationContentType,
  NotificationType,
} from './entities/notification-type.enum';
import {
  EmailTemplateType,
  NotificationPriority,
} from './enums/notification-priority.enum';
import { NotificationDTO } from './dtos/notification.dto';
import { NotificationStatus } from './entities/notification-status.enum';

@Injectable()
export class NotificationFactory {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  create(
    type: NotificationType,
    contentType: NotificationContentType,
    recipientId: string,
    data: any,
    priority: NotificationPriority = NotificationPriority.NORMAL,
  ): NotificationDTO {
    const { subject, content } = this.generateContent(type, contentType, data);

    const notificationDto = new NotificationDTO();
    notificationDto.type = type;
    notificationDto.contentType = contentType;
    notificationDto.message = content;
    notificationDto.subject = subject;
    notificationDto.priority = priority;
    notificationDto.status = NotificationStatus.UNREAD;
    notificationDto.metadata = data;

    // Determine if it's for a user or an organization
    if (data.userId) {
      notificationDto.userId = data.userId;
    } else if (data.organizationId) {
      notificationDto.organizationId = data.organizationId;
    }

    return notificationDto;
  }

  private generateContent(
    type: NotificationType,
    contentType: NotificationContentType,
    data: any,
  ): { subject: string; content: string } {
    switch (type) {
      case NotificationType.EMAIL:
        return this.generateEmailContent(contentType, data);
      case NotificationType.SMS:
      case NotificationType.PUSH:
      case NotificationType.IN_APP:
        return this.generateGenericContent(contentType, data);
      default:
        throw new Error(`Unsupported notification type: ${type}`);
    }
  }

  private generateEmailContent(
    contentType: NotificationContentType,
    data: any,
  ): { subject: string; content: string } {
    const emailTemplateType =
      this.mapContentTypeToEmailTemplateType(contentType);
    const { subject, body } = this.getEmailTemplate(emailTemplateType, data);
    return { subject, content: body };
  }

  private getEmailTemplate(
    emailTemplateType: EmailTemplateType,
    data: any,
  ): { subject: string; body: string } {
    switch (emailTemplateType) {
      case EmailTemplateType.ACCOUNT_VERIFICATION:
        return this.emailTemplateService.getAccountVerificationEmail(
          data.username,
          data.verificationLink,
        );
      case EmailTemplateType.ADMIN_NEW_USER_NOTIFICATION:
        return this.emailTemplateService.getAdminNewUserNotificationEmail(
          data.username,
          data.email,
          data.registrationDate,
          data.adminDashboardLink,
        );
      // Add other cases for different email template types
      default:
        throw new Error(
          `Unsupported email template type: ${emailTemplateType}`,
        );
    }
  }

  private generateGenericContent(
    contentType: NotificationContentType,
    data: any,
  ): { subject: string; content: string } {
    return {
      subject: `Notification: ${contentType}`,
      content: `${contentType}: ${JSON.stringify(data)}`,
    };
  }

  private mapContentTypeToEmailTemplateType(
    contentType: NotificationContentType,
  ): EmailTemplateType {
    // Implement mapping logic
    // This is a placeholder implementation
    switch (contentType) {
      case NotificationContentType.EMAIL_VERIFICATION:
        return EmailTemplateType.ACCOUNT_VERIFICATION;
      case NotificationContentType.NEW_USER_REGISTRATION:
        return EmailTemplateType.ADMIN_NEW_USER_NOTIFICATION;
      // Add more mappings
      default:
        throw new Error(
          `No email template mapping for content type: ${contentType}`,
        );
    }
  }
}
