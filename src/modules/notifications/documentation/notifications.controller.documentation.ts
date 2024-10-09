import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Notification } from '../entities/notification.entity';
import { NotificationStatus } from '../entities/notification-status.enum';

export function GetUserNotificationsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user notifications' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns user notifications',
      type: Notification,
      isArray: true,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      type: 'number',
      description: 'Page number for pagination',
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      type: 'number',
      description: 'Number of items per page',
    }),
    ApiQuery({
      name: 'status',
      required: false,
      enum: NotificationStatus,
      description: 'Filter notifications by status',
    }),
  );
}

export function GetUnreadCountDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get unread notifications count' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Returns unread notifications count',
      type: Number,
    }),
  );
}

export function MarkAsReadDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Mark notification as read' }),
    ApiParam({ name: 'id', required: true, description: 'Notification ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification marked as read',
    }),
  );
}

export function ArchiveNotificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Archive notification' }),
    ApiParam({ name: 'id', required: true, description: 'Notification ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification archived',
    }),
  );
}

export function CreateNotificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new notification' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Notification created successfully',
      type: Notification,
    }),
  );
}

export function UpdateNotificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a notification' }),
    ApiParam({ name: 'id', required: true, description: 'Notification ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification updated successfully',
      type: Notification,
    }),
  );
}

export function DeleteNotificationDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a notification' }),
    ApiParam({ name: 'id', required: true, description: 'Notification ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification deleted successfully',
    }),
  );
}
