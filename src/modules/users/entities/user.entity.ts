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
  ManyToMany,
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
import { UserStatus } from './user-status.entity';
import { UserRole } from './user-role.entity';

/**
 * User Entity represents individual users who can:
 * - Upload and manage their documents
 * - Submit documents for verification to organizations
 * - Track verification status
 * - Grant access to their documents
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

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  // Personal Information
  // These fields are essential for document verification
  @Column({ nullable: true, length: 100 })
  firstName?: string;

  @Column({ nullable: true, length: 100 })
  lastName?: string;

  @Column({ nullable: true, length: 100 })
  surname?: string;

  @Index()
  @Column({ unique: true, nullable: true, length: 100 })
  userName?: string;

  // Important identification fields for document verification
  @Index()
  @Column({ nullable: true, unique: true, length: 20 })
  phoneNumber?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true, length: 20 })
  gender?: string;

  @Column({ nullable: true, unique: true, length: 16 })
  fcn?: string; // National ID number

  @Column({ nullable: true, unique: true, length: 12 })
  fin?: string; // Tax ID number

  // Authentication and security
  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.Local,
  })
  provider: ProviderType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  // Two-factor authentication
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

  // Account status and security
  @Index()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_ACTIVATION,
  })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  isAccountLocked: boolean;

  // Document Management
  // Core functionality for document ownership and submission
  @OneToMany(() => Document, (document) => document.owner)
  ownedDocuments: Document[];

  @OneToMany(() => Document, (document) => document.uploader)
  uploadedDocuments: Document[];

  @ManyToMany(() => Document, (document) => document.usersWithAccess)
  accessibleDocuments: Document[];

  // Verification Management
  // Track document verifications initiated by the user
  @OneToMany(() => Verification, (verification) => verification.initiatedBy)
  verificationRequests: Verification[];

  // Blockchain Integration
  @Column({ nullable: true, unique: true, length: 42 })
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

  // Localization
  @Column({ default: 'en' })
  locale: string;

  // Compliance and Terms
  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt?: Date;
}
