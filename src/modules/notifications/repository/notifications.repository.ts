import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Notification } from '../entities/notification.entity';
import { BaseRepository } from 'src/core/repository/base.repository';
import { LoggerService } from 'src/common/services/logger.service';
import {
  PaginationOptions,
  PaginationResult,
} from 'src/common/interfaces/IPagination';
import { NotificationStatus } from '../entities/notification-status.enum';
import { PaginationQueryDto } from '@common/dtos/pagination-query.dto';

@Injectable()
export class NotificationRepository extends BaseRepository<Notification> {
  constructor(dataSource: DataSource, logger: LoggerService) {
    super(dataSource, Notification, logger);
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    return this.count({
      where: { user: { id: userId }, status: NotificationStatus.UNREAD },
    });
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.update(notificationId, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  async archiveNotification(notificationId: string): Promise<void> {
    await this.update(notificationId, {
      status: NotificationStatus.ARCHIVED,
    });
  }

  async getUserNotifications(
    userId: string,
    paginationOptions: PaginationQueryDto,
    status?: NotificationStatus,
  ): Promise<PaginationResult<Notification>> {
    const { page = 1, limit = 10 } = paginationOptions;

    const queryBuilder = this.repository
      .createQueryBuilder('notification')
      .where('notification.user.id = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      total,
      page,
      limit,
    };
  }

  async getOrganizationNotifications(
    organizationId: string,
    status?: NotificationStatus,
    paginationOptions: PaginationOptions<Notification> = {},
  ): Promise<PaginationResult<Notification>> {
    const {
      page = 1,
      limit = 10,
      sort = [{ field: 'createdAt', order: 'DESC' }],
    } = paginationOptions;

    const queryOptions: any = {
      where: { organization: { id: organizationId } },
      relations: ['organization'],
    };

    if (status) {
      queryOptions.where.status = status;
    }

    return this.findAll({
      page,
      limit,
      sort,
      options: queryOptions,
    });
  }

  async getFailedNotifications(
    paginationOptions: PaginationQueryDto = { page: 1, limit: 10 },
  ): Promise<PaginationResult<Notification>> {
    const { page = 1, limit = 10 } = paginationOptions;
    const queryBuilder = this.repository
      .createQueryBuilder('notification')
      .where('notification.status = :status', {
        status: NotificationStatus.FAILED,
      })
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      total,
      page,
      limit,
    };
  }
}
