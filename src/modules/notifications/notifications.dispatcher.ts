import { Injectable, Logger } from '@nestjs/common';
import { NotificationRepository } from './repository/notifications.repository';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { PushNotificationService } from './services/push-notifications.service';
import { UsersService } from '@modules/users/services/users.service';
import { NotificationType } from './entities/notification-type.enum';
import { NotificationPriority } from './enums/notification-priority.enum';
import { NotificationDTO } from './dtos/notification.dto';
import { UserResponseDto } from '@modules/users/dtos/user-response.dto';
import { NotificationStatus } from './entities/notification-status.enum';

@Injectable()
export class NotificationDispatcher {
  private readonly logger = new Logger(NotificationDispatcher.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly usersService: UsersService,
  ) {}

  async dispatch(notificationDto: NotificationDTO): Promise<void> {
    const notification = new NotificationDTO();
    Object.assign(notification, notificationDto);

    await this.notificationRepository.create(notification);

    const user = await this.usersService.findOneById(
      notificationDto.userId || '',
    );
    if (!user) {
      await this.notificationRepository.update(notification.id, {
        status: NotificationStatus.FAILED,
      });
      throw new Error(`User not found for ID: ${notificationDto.userId}`);
    }

    if (this.shouldSendNotification(notification.type)) {
      try {
        await this.sendNotification(notification, user);
        await this.notificationRepository.update(notification.id, {
          status: NotificationStatus.SENT,
        });
      } catch (error) {
        await this.notificationRepository.update(notification.id, {
          status: NotificationStatus.FAILED,
        });
        this.logger.error(
          `Failed to send notification ${notification.id}`,
          error.stack,
        );
        throw error;
      }
    }

    if (notification.priority === NotificationPriority.HIGH) {
      await this.handleHighPriorityNotification(notification, user);
    }
  }

  private shouldSendNotification(type: NotificationType): boolean {
    // Implement your logic here. For now, we'll allow all notifications
    return true;
  }

  private async sendNotification(
    notification: NotificationDTO,
    user: UserResponseDto,
  ): Promise<void> {
    switch (notification.type) {
      case NotificationType.EMAIL:
        await this.emailService.sendEmail(
          user.email,
          notification.subject || '',
          notification.message,
        );
        break;
      case NotificationType.SMS:
        if (user.address?.phoneNumber) {
          await this.smsService.sendSMS(
            user.address.phoneNumber,
            notification.message,
          );
        } else {
          throw new Error('User has no phone number for SMS notification');
        }
        break;
      case NotificationType.PUSH:
        await this.pushNotificationService.sendPushNotification(
          user.id,
          notification.subject || '',
          notification.message,
          {
            contentType: notification.contentType,
            priority: notification.priority,
          },
        );
        break;
      case NotificationType.IN_APP:
        // The notification is already saved in the repository
        break;
      default:
        throw new Error(`Unsupported notification type: ${notification.type}`);
    }
  }

  private async handleHighPriorityNotification(
    notification: NotificationDTO,
    user: UserResponseDto,
  ): Promise<void> {
    if (notification.type !== NotificationType.EMAIL) {
      await this.emailService.sendEmail(
        user.email,
        `High Priority: ${notification.subject || ''}`,
        `This is a high priority notification:\n\n${notification.message}`,
      );
    }
  }

  async retryFailedNotifications(): Promise<void> {
    const failedNotificationsResult =
      await this.notificationRepository.getFailedNotifications();
    for (const notification of failedNotificationsResult.data) {
      try {
        const notificationDto = new NotificationDTO();
        Object.assign(notificationDto, notification);
        await this.dispatch(notificationDto);
      } catch (error) {
        this.logger.error(
          `Failed to retry notification ${notification.id}`,
          error.stack,
        );
      }
    }
  }

  async scheduleNotification(
    notificationDto: NotificationDTO,
    scheduleTime: Date,
  ): Promise<void> {
    // Implement scheduling logic
    // This could involve using a job queue like Bull
    this.logger.log(`Notification scheduled for ${scheduleTime}`);
    // For now, we'll just create the notification with a PENDING status
    const notification = new NotificationDTO();
    Object.assign(notification, notificationDto);
    notification.status = NotificationStatus.PENDING;
    notification.scheduledFor = scheduleTime;
    await this.notificationRepository.create(notification);
  }
}
