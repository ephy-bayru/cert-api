import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToMany,
  Index,
  Unique,
  Check,
  JoinColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';
import { OrganizationStatus } from './organization-status.enum';
import { Document } from '@modules/documents/entities/document.entity';
import { Address } from '@modules/users/entities/address.entity';
import { Notification } from '@modules/notifications/entities/notification.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';
import { OrganizationUser } from './organization-user.entity';

/**
 * Organization Entity represents:
 * - Company or institution that can upload or own documents
 * - Verify documents from users
 * - Potentially assign documents to a user if the org is the owner
 */
@Entity('organizations')
@Unique(['name', 'deletedAt'])
@Check(`"contactEmail" IS NOT NULL OR "contactPhoneNumber" IS NOT NULL`) // Requires at least one contact method
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Organization Information
  @Index()
  @Column({ length: 200 })
  name: string;

  @Column({ nullable: true, length: 150 })
  @Index({ unique: true, where: '"contactEmail" IS NOT NULL' })
  contactEmail?: string;

  @Column({ nullable: true, length: 20 })
  @Index({ unique: true, where: '"contactPhoneNumber" IS NOT NULL' })
  contactPhoneNumber?: string;

  @Column({ nullable: true, length: 100 })
  @Index()
  industry?: string;

  @Column({ type: 'date', nullable: true })
  foundedDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true, length: 255 })
  website?: string;

  @Column({ nullable: true, length: 255 })
  logoUrl?: string;

  // Organization Status and Verification
  @Index()
  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.PENDING_APPROVAL,
  })
  status: OrganizationStatus;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ nullable: true })
  verifiedBy?: string;

  // Compliance and Legal Information
  @Column({ type: 'jsonb', nullable: true })
  complianceInfo?: {
    taxId?: string;
    registrationNumber?: string;
    licenses?: string[];
    certifications?: string[];
  };

  @Column({ type: 'jsonb', default: {} })
  settings: {
    requireTwoFactorAuth?: boolean;
    allowExternalVerifiers?: boolean;
    documentRetentionDays?: number;
    autoArchiveEnabled?: boolean;
  };

  // Address Information
  @OneToOne(() => Address)
  @JoinColumn()
  address: Address;

  // Relationships
  @OneToMany(() => OrganizationUser, (orgUser) => orgUser.organization)
  members: OrganizationUser[];

  @OneToMany(() => Verification, (verification) => verification.organization)
  verificationRequests: Verification[];

  /**
   * If you keep distinct sets of documents for "verifiedDocuments" vs. "accessibleDocuments",
   * you can define separate relationships. "accessibleDocuments" is for documents that
   * this org can access.  "verifiedDocuments" might be a separate join.
   */
  @ManyToMany(() => Document)
  @JoinColumn()
  verifiedDocuments: Document[];

  @ManyToMany(() => Document, (doc) => doc.organizationsWithAccess)
  accessibleDocuments: Document[];

  // Blockchain Integration
  @Index({ unique: true })
  @Column({ nullable: true, length: 42 })
  blockchainAddress?: string;

  @Column({ type: 'jsonb', nullable: true })
  blockchainMetadata?: {
    network: string;
    contractAddress?: string;
    lastSyncedBlock?: number;
  };

  // Notifications and Audit
  @OneToMany(() => Notification, (notification) => notification.organization)
  notifications: Notification[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.organization)
  auditLogs: AuditLog[];

  // Metadata and Tracking
  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  // Timestamps and Versioning
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ nullable: true })
  deletedBy?: string;
}
