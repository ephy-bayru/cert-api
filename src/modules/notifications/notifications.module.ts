import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationRepository } from './repository/notifications.repository';
import { NotificationController } from './controllers/notifications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService, NotificationRepository],
})
export class NotificationsModule {}
