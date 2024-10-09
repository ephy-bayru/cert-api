import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { NotificationType } from '../entities/notification-type.enum';
import { NotificationStatus } from '../entities/notification-status.enum';

@Entity('notifications')
export class Notification {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the notification',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: NotificationType,
    example: NotificationType.PUSH,
    description: 'Type of the notification',
  })
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    example: 'Your document has been verified',
    description: 'Message content of the notification',
  })
  @Column({ type: 'text' })
  message: string;

  @ApiPropertyOptional({
    example: '2023-04-15T10:30:00Z',
    description: 'Timestamp when the notification was read',
  })
  @Column({ type: 'timestamp', nullable: true })
  readAt?: Date;

  @ApiPropertyOptional({
    example: 'https://example.com/document/123',
    description: 'URL for any action associated with the notification',
  })
  @Column({ nullable: true })
  actionUrl?: string;

  @ApiProperty({
    enum: NotificationStatus,
    example: NotificationStatus.UNREAD,
    description: 'Current status of the notification',
  })
  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @ApiProperty({
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    description: 'Priority level of the notification',
  })
  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiPropertyOptional({
    example: { documentId: '123', verifierId: '456' },
    description: 'Additional metadata for the notification',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    type: () => User,
    description: 'User associated with the notification',
  })
  @Index()
  @ManyToOne(() => User, (user) => user.notifications, { nullable: true })
  user?: User;

  @ApiPropertyOptional({
    type: () => Organization,
    description: 'Organization associated with the notification',
  })
  @Index()
  @ManyToOne(() => Organization, (organization) => organization.notifications, {
    nullable: true,
  })
  organization?: Organization;

  @ApiProperty({
    example: '2023-04-15T10:00:00Z',
    description: 'Timestamp when the notification was created',
  })
  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
