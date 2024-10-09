import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { NotificationPriority } from '../enums/notification-priority.enum';
import { User } from '@modules/users/entities/user.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { NotificationType } from './notification-type.enum';
import { NotificationStatus } from './notification-status.enum';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  actionUrl?: string;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>; // JSON object for additional data

  @Index()
  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  user?: User;

  @Index()
  @ManyToOne(() => Organization, (organization) => organization.notifications, {
    nullable: true,
  })
  organization?: Organization;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
