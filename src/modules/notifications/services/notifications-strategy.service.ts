import { Injectable, Logger } from '@nestjs/common';
import { NotificationType } from '../entities/notification-type.enum';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';
import { PushNotificationService } from './push-notifications.service';
import {
  NotificationData,
  EmailNotificationData,
  SMSNotificationData,
  PushNotificationData,
  isEmailNotification,
  isPushNotification,
  BatchResponse,
  AccountVerificationEmailData,
  AdminNewUserNotificationEmailData,
  AdminNewOrganizationNotificationEmailData,
  DocumentSubmissionNotificationEmailData,
  DocumentStatusUpdateEmailData,
  PasswordResetEmailData,
} from '../interfaces/notification.interface';
import {
  EmailTemplateType,
  NotificationPriority,
} from '../enums/notification-priority.enum';

@Injectable()
export class NotificationStrategyService {
  private readonly logger = new Logger(NotificationStrategyService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  async sendNotification(
    type: NotificationType,
    data: NotificationData,
  ): Promise<void> {
    try {
      const priority = data.priority || NotificationPriority.NORMAL;
      this.logger.log(`Sending ${priority} priority ${type} notification`);

      switch (type) {
        case NotificationType.EMAIL:
          await this.sendEmailNotification(data as EmailNotificationData);
          break;
        case NotificationType.SMS:
          await this.sendSMSNotification(data as SMSNotificationData);
          break;
        case NotificationType.PUSH:
          await this.sendPushNotification(data as PushNotificationData);
          break;
        case NotificationType.IN_APP:
          await this.sendInAppNotification(data);
          break;
        default:
          throw new Error(`Unsupported notification type: ${type}`);
      }

      this.logger.log(`Notification sent successfully: ${type}`);
    } catch (error) {
      this.logger.error(
        `Failed to send ${type} notification: ${error.message}`,
      );
      throw error;
    }
  }

  private async sendEmailNotification(
    data: EmailNotificationData,
  ): Promise<void> {
    if (!isEmailNotification(data)) {
      throw new Error('Invalid email notification data');
    }

    switch (data.emailType) {
      case EmailTemplateType.ACCOUNT_VERIFICATION:
        await this.sendAccountVerificationEmail(data);
        break;
      case EmailTemplateType.ADMIN_NEW_USER_NOTIFICATION:
        await this.sendAdminNewUserNotificationEmail(data);
        break;
      case EmailTemplateType.ADMIN_NEW_ORGANIZATION_NOTIFICATION:
        await this.sendAdminNewOrganizationNotificationEmail(data);
        break;
      case EmailTemplateType.DOCUMENT_SUBMISSION_NOTIFICATION:
        await this.sendDocumentSubmissionNotificationEmail(data);
        break;
      case EmailTemplateType.DOCUMENT_STATUS_UPDATE:
        await this.sendDocumentStatusUpdateEmail(data);
        break;
      case EmailTemplateType.PASSWORD_RESET:
        await this.sendPasswordResetEmail(data);
        break;
      default:
        const exhaustiveCheck: never = data;
        throw new Error(
          `Unsupported email type: ${(exhaustiveCheck as EmailNotificationData).emailType}`,
        );
    }
  }

  private async sendAccountVerificationEmail(
    data: AccountVerificationEmailData,
  ): Promise<void> {
    await this.emailService.sendAccountVerificationEmail(
      data.recipient,
      data.username,
      data.verificationLink,
    );
  }

  private async sendAdminNewUserNotificationEmail(
    data: AdminNewUserNotificationEmailData,
  ): Promise<void> {
    await this.emailService.sendAdminNewUserNotificationEmail(
      data.recipient,
      data.username,
      data.email,
      data.registrationDate,
    );
  }

  private async sendAdminNewOrganizationNotificationEmail(
    data: AdminNewOrganizationNotificationEmailData,
  ): Promise<void> {
    await this.emailService.sendAdminNewOrganizationNotificationEmail(
      data.recipient,
      data.orgName,
      data.email,
      data.registrationDate,
      data.orgType,
    );
  }

  private async sendDocumentSubmissionNotificationEmail(
    data: DocumentSubmissionNotificationEmailData,
  ): Promise<void> {
    await this.emailService.sendDocumentSubmissionNotificationEmail(
      data.recipient,
      data.orgName,
      data.documentTitle,
      data.submitterName,
      data.submissionDate,
      data.documentType,
    );
  }

  private async sendDocumentStatusUpdateEmail(
    data: DocumentStatusUpdateEmailData,
  ): Promise<void> {
    await this.emailService.sendDocumentStatusUpdateEmail(
      data.recipient,
      data.username,
      data.documentTitle,
      data.newStatus,
      data.updateDate,
      data.updatedBy,
    );
  }

  private async sendPasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<void> {
    await this.emailService.sendPasswordResetEmail(
      data.recipient,
      data.username,
      data.resetLink,
    );
  }

  private async sendSMSNotification(data: SMSNotificationData): Promise<void> {
    const { recipient, text } = data;
    await this.smsService.sendSMS(recipient, text);
  }

  private async sendPushNotification(
    data: PushNotificationData,
  ): Promise<void> {
    if (!isPushNotification(data)) {
      throw new Error('Invalid push notification data');
    }

    const { token, title, text, data: additionalData } = data;
    await this.pushNotificationService.sendPushNotification(
      token,
      title,
      text,
      additionalData,
    );
  }

  private async sendInAppNotification(data: NotificationData): Promise<void> {
    // Implement in-app notification logic here
    // This could involve saving the notification to a database or sending it through a websocket
    this.logger.log('In-app notification sent', data);
  }

  async sendBulkNotifications(
    type: NotificationType,
    dataArray: NotificationData[],
  ): Promise<void> {
    const promises = dataArray.map((data) => this.sendNotification(type, data));
    await Promise.all(promises);
  }

  async sendMulticastPushNotification(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<BatchResponse> {
    return this.pushNotificationService.sendMulticastPushNotification(
      tokens,
      title,
      body,
      data,
    );
  }

  async sendTopicPushNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<string> {
    return this.pushNotificationService.sendTopicPushNotification(
      topic,
      title,
      body,
      data,
    );
  }

  async subscribeToTopic(token: string, topic: string): Promise<void> {
    await this.pushNotificationService.subscribeToTopic(token, topic);
  }

  async unsubscribeFromTopic(token: string, topic: string): Promise<void> {
    await this.pushNotificationService.unsubscribeFromTopic(token, topic);
  }

  async scheduleNotification(
    type: NotificationType,
    data: NotificationData,
    scheduledTime: Date,
  ): Promise<void> {
    // Implement scheduling logic here
    // This could involve using a job queue like Bull or a cron job
    this.logger.log(`Notification scheduled for ${scheduledTime}`, {
      type,
      data,
      priority: data.priority || NotificationPriority.NORMAL,
    });
  }
}
