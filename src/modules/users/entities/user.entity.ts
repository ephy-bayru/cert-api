import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
  DeleteDateColumn,
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { LoginHistory } from './login-history.entity';
import { Address } from './address.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { Notification } from '@modules/notifications/entities/notification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';
import { UserPreferences } from './user-preference.entity';
import { ProviderType } from '../enums/provider-types';
import { UserStatus } from './user-status.enum';
import { GlobalRole } from '@common/enums/global-role.enum';

/**
 * User Entity represents individual users who can:
 * - Upload and manage their documents
 * - Submit documents for verification to organizations
 * - Track verification status
 * - Possibly receive a document assigned by an organization
 */
@Entity('users')
@Unique(['email', 'userName', 'fcn', 'fin'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic user identification and authentication
  @Index()
  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  // Personal Information
  @Column({ nullable: true, length: 100 })
  firstName?: string;

  @Column({ nullable: true, length: 100 })
  lastName?: string;

  @Column({ nullable: true, length: 100 })
  surname?: string;

  @Index()
  @Column({ unique: true, nullable: true, length: 100 })
  userName?: string;

  @Index()
  @Column({ nullable: true, unique: true, length: 20 })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true, length: 20 })
  gender?: string;

  @Column({ nullable: true, unique: true, length: 16 })
  fcn?: string; // National ID

  @Column({ nullable: true, unique: true, length: 12 })
  fin?: string; // Tax ID

  // Authentication and security
  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.local,
  })
  provider: ProviderType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: GlobalRole,
    array: true,
    default: [GlobalRole.END_USER],
  })
  roles: GlobalRole[];

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string;

  // Security tokens
  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken?: string;

  // User preferences and settings
  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  preferences: UserPreferences;

  @OneToOne(() => Address, (address) => address.user, { cascade: true })
  address: Address;

  // Account status
  @Index()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_ACTIVATION,
  })
  status: UserStatus;

  @Column({ default: false })
  isTestUser: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  isAccountLocked: boolean;

  // Document Management
  @OneToMany(() => Document, (document) => document.owner)
  ownedDocuments: Document[];

  @OneToMany(() => Document, (document) => document.uploader)
  uploadedDocuments: Document[];

  // (Removed the many-to-many "accessibleDocuments" to reflect "can't share with multiple users.")

  // Verification Management
  @OneToMany(() => Verification, (verification) => verification.initiatedBy)
  verificationRequests: Verification[];

  // Blockchain Integration
  @Index({ unique: true })
  @Column({ nullable: true, length: 42 })
  blockchainAddress?: string;

  // Notifications
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Audit and tracking
  @OneToMany(() => LoginHistory, (history) => history.user)
  loginHistory: LoginHistory[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.performedBy)
  auditLogs: AuditLog[];

  // Timestamps and metadata
  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ default: 'en' })
  locale: string;

  // Compliance and Terms
  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt?: Date;
}
