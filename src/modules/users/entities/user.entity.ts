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
  JoinTable,
  Unique,
} from 'typeorm';
import { LoginHistory } from './login-history.entity';
import { Address } from './address.entity';
import { Exclude } from 'class-transformer';
import { UserRole } from './user-role.entity';
import { ProviderType } from '../enums/provider-types';
import { UserPreferences } from './user-preference.entity';
import { UserStatus } from './user-status.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { Notification } from '@modules/notifications/entities/notification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';

@Entity('users')
@Unique(['email', 'userName', 'fcn', 'fin'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, length: 150 })
  email: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true, length: 100 })
  firstName?: string;

  @Column({ nullable: true, length: 100 })
  lastName?: string;

  @Column({ nullable: true, length: 100 })
  surname?: string;

  @Index()
  @Column({ unique: true, nullable: true, length: 100 })
  userName?: string;

  @Column({ nullable: true, length: 10 })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ nullable: true, length: 100 })
  nationality?: string;

  @Column({ nullable: true, length: 10 })
  sex?: string;

  @Index()
  @Column({ nullable: true, unique: true, length: 20 })
  phoneNumber?: string;

  @Column({ nullable: true, unique: true, length: 16 })
  fcn?: string;

  @Column({ nullable: true, unique: true, length: 12 })
  fin?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.Local,
  })
  provider: ProviderType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @OneToOne(() => UserPreferences, (preferences) => preferences.user, {
    cascade: true,
  })
  preferences: UserPreferences;

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt?: Date;

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

  @Column({ type: 'timestamp', nullable: true })
  consentGivenAt?: Date;

  @OneToMany(() => LoginHistory, (history) => history.user, { lazy: true })
  loginHistory: Promise<LoginHistory[]>;

  @OneToOne(() => Address, (address) => address.user, { cascade: true })
  address: Address;

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

  @Column({ nullable: true, unique: true, length: 42 })
  blockchainAddress?: string;

  @OneToMany(() => Document, (document) => document.owner, { lazy: true })
  documents: Promise<Document[]>;

  @OneToMany(() => Document, (document) => document.uploader)
  uploadedDocuments: Document[];

  @ManyToMany(() => Document, (document) => document.usersWithAccess)
  accessibleDocuments: Document[];
  
  @ManyToMany(() => Organization, (organization) => organization.users, {
    lazy: true,
  })
  @JoinTable({
    name: 'user_organizations',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  organizations: Promise<Organization[]>;

  @ManyToMany(() => Organization, (organization) => organization.adminUsers, {
    lazy: true,
  })
  adminOrganizations: Promise<Organization[]>;

  @OneToMany(() => Verification, (verification) => verification.initiatedBy, {
    lazy: true,
  })
  verifications: Promise<Verification[]>;

  @OneToMany(() => Verification, (verification) => verification.reviewedBy, {
    lazy: true,
  })
  verificationsReviewed: Promise<Verification[]>;

  @OneToMany(() => Notification, (notification) => notification.user, {
    lazy: true,
  })
  notifications: Promise<Notification[]>;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.performedBy)
  auditLogs: AuditLog[];
}
