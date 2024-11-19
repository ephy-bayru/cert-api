import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  DeleteDateColumn,
  VersionColumn,
  JoinColumn,
} from 'typeorm';
import { OrganizationUserRole } from './organization-user-role.enum';
import { Organization } from './organization.entity';
import { Exclude } from 'class-transformer';

/**
 * Represents organization-specific users who can:
 * - Login to organization portal
 * - Verify documents based on their role
 * - Manage organization resources based on permissions
 */
@Entity('organization_users')
@Unique(['organizationId', 'email'])
@Unique(['organizationId', 'userName'])
export class OrganizationUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Organization Relationship
  @Index()
  @ManyToOne(() => Organization, (org) => org.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  // Authentication and Security
  @Index()
  @Column({ length: 150 })
  email: string;

  @Column({ length: 100 })
  userName: string;

  @Column({ select: false })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  // Personal Information
  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ nullable: true, length: 100 })
  middleName?: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber?: string;

  @Column({ nullable: true, length: 255 })
  profileImageUrl?: string;

  // Professional Information
  @Column({ nullable: true, length: 100 })
  title?: string;

  @Column({ nullable: true, length: 100 })
  department?: string;

  @Column({ nullable: true, length: 100 })
  employeeId?: string;

  // Role and Permissions
  @Index()
  @Column({
    type: 'enum',
    enum: OrganizationUserRole,
  })
  role: OrganizationUserRole;

  @Column({ type: 'jsonb', default: {} })
  permissions: {
    canVerifyDocuments?: boolean;
    canManageUsers?: boolean;
    canAccessDocuments?: boolean;
    canManageSettings?: boolean;
    documentTypes?: string[]; // Types of documents they can verify
    verificationLimit?: number; // Daily verification limit
  };

  // Status and Access Control
  @Index()
  @Column({ default: false })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lockedAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  lockExpiresAt?: Date;

  // Two-Factor Authentication
  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  @Exclude({ toPlainOnly: true })
  twoFactorSecret?: string;

  // Activity Tracking
  @Column({ type: 'timestamp', nullable: true })
  lastAccess?: Date;

  @Column({ type: 'jsonb', nullable: true })
  activityLog?: {
    lastVerificationAt?: Date;
    verificationsToday?: number;
    totalVerifications?: number;
    lastDocumentAccess?: Date;
  };

  // Preferences
  @Column({ type: 'jsonb', default: {} })
  preferences: {
    emailNotifications?: boolean;
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };

  // Timestamps and Metadata
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  // Deactivation Information
  @Column({ type: 'timestamp', nullable: true })
  deactivatedAt?: Date;

  @Column({ type: 'uuid', nullable: true })
  deactivatedBy?: string;

  @Column({ nullable: true, length: 500 })
  deactivationReason?: string;

  // Access Restrictions
  @Column({ type: 'jsonb', nullable: true })
  restrictions?: {
    ipWhitelist?: string[];
    allowedTimeRanges?: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }[];
    maxDailyVerifications?: number;
    documentTypeRestrictions?: string[];
  };

  // Training and Certification
  @Column({ type: 'jsonb', nullable: true })
  certifications?: {
    name: string;
    issuedAt: Date;
    expiresAt?: Date;
    issuedBy: string;
    documentUrl?: string;
  }[];
}
