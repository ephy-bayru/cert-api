import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Notification } from '../entities/notification.entity';
import { PaginationResult } from 'src/common/interfaces/IPagination';
import { NotificationService } from '../services/notifications.service';
import { NotificationStatus } from '../entities/notification-status.enum';
import { CreateNotificationDto } from '../dtos/create-notification.dto';
import { UpdateNotificationDto } from '../dtos/update-notification.dto';
import { PaginationQueryDto } from '@common/dtos/pagination-query.dto';
import { User } from '@common/decorators/user.decorator';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import {
  GetUserNotificationsDocs,
  GetUnreadCountDocs,
  MarkAsReadDocs,
  ArchiveNotificationDocs,
  CreateNotificationDocs,
  UpdateNotificationDocs,
  DeleteNotificationDocs,
} from '../documentation/notifications.controller.documentation';

@ApiTags('Notifications')
@Controller({ path: 'notifications', version: '1' })
@UseFilters(GlobalExceptionFilter)
@UseInterceptors(TransformInterceptor)
// @UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @GetUserNotificationsDocs()
  async getUserNotifications(
    @User('id') userId: string,
    @Query() paginationQuery: PaginationQueryDto,
    @Query('status') status?: NotificationStatus,
  ): Promise<PaginationResult<Notification>> {
    return this.notificationService.getUserNotifications(
      userId,
      paginationQuery,
      status,
    );
  }

  @Get('unread-count')
  @GetUnreadCountDocs()
  async getUnreadCount(@User('id') userId: string): Promise<{ count: number }> {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/mark-as-read')
  @MarkAsReadDocs()
  async markAsRead(@Param('id') id: string): Promise<void> {
    await this.notificationService.markAsRead(id);
  }

  @Patch(':id/archive')
  @ArchiveNotificationDocs()
  async archiveNotification(@Param('id') id: string): Promise<void> {
    await this.notificationService.archiveNotification(id);
  }

  @Post()
  @CreateNotificationDocs()
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.createNotification(createNotificationDto);
  }

  @Patch(':id')
  @UpdateNotificationDocs()
  async updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<Notification> {
    return this.notificationService.updateNotification(
      id,
      updateNotificationDto,
    );
  }

  @Delete(':id')
  @DeleteNotificationDocs()
  async deleteNotification(@Param('id') id: string): Promise<void> {
    await this.notificationService.deleteNotification(id);
  }
}
