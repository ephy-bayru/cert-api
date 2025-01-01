import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
} from 'typeorm';
import { User } from './user.entity';
import { ThemePreference } from '../enums/theme-preference.enum';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.preferences)
  user: User;

  @Column({ default: true })
  receiveEmailNotifications: boolean;

  @Column({ default: true })
  receiveSmsNotifications: boolean;

  @Column({ default: true })
  receivePushNotifications: boolean;

  @Column({ default: true })
  receiveMarketingEmails: boolean;

  @Column({ default: true })
  receiveProductUpdates: boolean;

  @Column({ default: true })
  receiveSecurityAlerts: boolean;

  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({
    type: 'enum',
    enum: ThemePreference,
    default: ThemePreference.DARK,
  })
  themePreference: ThemePreference;

  @Column({ default: false })
  darkModeEnabled: boolean;

  @Column({ default: false })
  use24HourClock: boolean;

  @Column({ default: true })
  personalizedContent: boolean;

  @Column({ default: true })
  shareActivityStatus: boolean;

  @Column({ default: true })
  showOnlineStatus: boolean;

  @Column({ default: false })
  rememberDevice: boolean;

  @Column({ default: 30 })
  sessionTimeoutInMinutes: number;
}
