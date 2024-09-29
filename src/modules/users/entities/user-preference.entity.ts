import { Column } from 'typeorm';

export enum ThemePreference {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export class UserPreferences {
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

  // Language and Locale
  @Column({ default: 'en' })
  language: string;

  @Column({ default: 'UTC' })
  timezone: string;

  @Column({
    type: 'enum',
    enum: ThemePreference,
    default: ThemePreference.SYSTEM,
  })
  themePreference: ThemePreference;

  @Column({ default: false })
  darkModeEnabled: boolean;

  @Column({ default: false })
  use24HourClock: boolean;

  @Column({ default: true })
  personalizedContent: boolean;

  // Privacy Settings
  @Column({ default: true })
  shareActivityStatus: boolean;

  @Column({ default: true })
  showOnlineStatus: boolean;

  // Security Settings
  @Column({ default: false })
  rememberDevice: boolean;

  @Column({ default: 30 })
  sessionTimeoutInMinutes: number;
}
