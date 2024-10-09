import { Injectable, NotFoundException } from '@nestjs/common';
import { Notification } from '../entities/notification.entity';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { LoggerService } from 'src/common/services/logger.service';
import { NotificationRepository } from '../repository/notifications.repository';
import { NotificationStatus } from '../entities/notification-status.enum';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { PaginationQueryDto } from '@common/dtos/pagination-query.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly logger: LoggerService,
  ) {}

  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notificationData: Partial<Notification> = {
      ...createNotificationDto,
      status: NotificationStatus.UNREAD,
    };
    const notification =
      await this.notificationRepository.create(notificationData);
    this.logger.log('Notification created', 'NotificationService', {
      notificationId: notification.id,
    });
    return notification;
  }

  async getUserNotifications(
    userId: string,
    paginationOptions: PaginationQueryDto,
    status?: NotificationStatus,
  ): Promise<PaginationResult<Notification>> {
    return this.notificationRepository.getUserNotifications(
      userId,
      paginationOptions,
      status,
    );
  }

  async getOrganizationNotifications(
    organizationId: string,
    status?: NotificationStatus,
    paginationOptions?: PaginationOptions<Notification>,
  ): Promise<PaginationResult<Notification>> {
    return this.notificationRepository.getOrganizationNotifications(
      organizationId,
      status,
      paginationOptions,
    );
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId);
    this.logger.log('Notification marked as read', 'NotificationService', {
      notificationId,
    });
  }

  async archiveNotification(notificationId: string): Promise<void> {
    await this.notificationRepository.archiveNotification(notificationId);
    this.logger.log('Notification archived', 'NotificationService', {
      notificationId,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.getUnreadNotificationsCount(userId);
  }

  async updateNotification(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findOne(id);
    if (!notification) {
      this.logger.warn('Notification not found', 'NotificationService', {
        notificationId: id,
      });
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }

    await this.notificationRepository.update(
      id,
      updateNotificationDto as Partial<Notification>,
    );

    const updatedNotification = await this.notificationRepository.findOne(id);
    if (!updatedNotification) {
      throw new NotFoundException(
        `Updated notification with ID "${id}" not found`,
      );
    }

    this.logger.log('Notification updated', 'NotificationService', {
      notificationId: id,
    });
    return updatedNotification;
  }

  async deleteNotification(id: string): Promise<void> {
    const result = await this.notificationRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(
        'Notification not found for deletion',
        'NotificationService',
        { notificationId: id },
      );
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    this.logger.log('Notification deleted', 'NotificationService', {
      notificationId: id,
    });
  }
}
