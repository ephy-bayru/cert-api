import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
  VersionColumn,
  Check,
} from 'typeorm';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { User } from '@modules/users/entities/user.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';
import { DocumentStatus } from './document-status.enum';
import { DocumentType } from './document-type.enum';

/**
 * Document Entity represents files that can be:
 * - Uploaded by a user OR an organization
 * - If uploaded by a user => user is 'owner' + can share with multiple organizations
 * - If uploaded by an organization => org is 'organizationOwner' + can assign doc to exactly ONE user
 * - Verified by organizations
 * - (No multi-user sharing)
 * - Tracked through blockchain
 */
@Entity('documents')
@Check(`"file_size" > 0`)
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Document Information
  @Index()
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: DocumentType,
    nullable: true,
    name: 'document_type',
  })
  documentType?: DocumentType;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  // File Information
  @Column({ name: 'file_url' })
  fileUrl: string;

  @Index()
  @Column({ name: 'file_hash' })
  fileHash: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize: number;

  @Index()
  @Column({ length: 100, name: 'file_type' })
  fileType: string;

  // Document Status and Lifecycle
  @Index()
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate?: Date;

  /**
   * Ownership:
   * Either a User is the owner, OR an Organization is the owner.
   * If 'owner' is set => this doc belongs to a user.
   * If 'organizationOwner' is set => belongs to an organization.
   */
  @ManyToOne(() => User, (user) => user.ownedDocuments, { nullable: true })
  owner?: User;

  @Column({ name: 'owner_id', nullable: true })
  ownerId?: string;

  @ManyToOne(() => Organization, { nullable: true })
  organizationOwner?: Organization;

  @Column({ name: 'organization_owner_id', nullable: true })
  organizationOwnerId?: string;

  /**
   * Uploader:
   * If a user is physically uploading, store their user ID here.
   * If an organization is uploading, store the org’s user rep or handle separately.
   */
  @ManyToOne(() => User, (user) => user.uploadedDocuments, { nullable: true })
  uploader?: User;

  @Column({ name: 'uploader_id', nullable: true })
  uploaderId?: string;

  /**
   * Single user assigned by an organization. (E.g., an org awarding a degree to a user.)
   * Only used when 'organizationOwner' is defined.
   * This is optional and does NOT imply multiple user sharing.
   */
  @ManyToOne(() => User, { nullable: true })
  assignedToUser?: User;

  @Column({ name: 'assigned_to_user_id', nullable: true })
  assignedToUserId?: string;

  /**
   * Document Access Management:
   * A user who owns a doc can share with multiple organizations.
   * This is a many-to-many relation. We do NOT share docs with multiple users.
   */
  @ManyToMany(() => Organization, (org) => org.accessibleDocuments)
  @JoinTable({
    name: 'document_organization_access',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  organizationsWithAccess: Organization[];

  // Verification Management
  @OneToMany(() => Verification, (verification) => verification.document)
  verifications: Verification[];

  @Column({ type: 'jsonb', nullable: true, name: 'verification_statuses' })
  verificationStatuses?: Record<string, DocumentStatus>;

  // Document Access History
  @Column({ type: 'jsonb', nullable: true, name: 'access_history' })
  accessHistory?: {
    userId?: string;
    organizationId?: string;
    accessType: 'VIEW' | 'DOWNLOAD' | 'VERIFY';
    timestamp: Date;
    ipAddress?: string;
  }[];

  // Blockchain Integration
  @Column({ nullable: true, name: 'blockchain_tx_hash' })
  blockchainTxHash?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'blockchain_metadata' })
  blockchainMetadata?: {
    networkId: string;
    contractAddress: string;
    tokenId?: string;
    verificationProof?: string;
  };

  // Version Control
  @VersionColumn()
  version: number;

  // Timestamps and Lifecycle
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'submitted_at' })
  submittedAt?: Date;

  @Column({ nullable: true, name: 'last_verified_at' })
  lastVerifiedAt?: Date;

  @Column({ nullable: true, name: 'revoked_at' })
  revokedAt?: Date;

  @Column({ nullable: true, name: 'archived_at' })
  archivedAt?: Date;

  // Audit and Tracking
  @OneToMany(() => AuditLog, (auditLog) => auditLog.document)
  auditLogs: AuditLog[];

  @Column({ nullable: true, name: 'latest_audit_log_id' })
  latestAuditLogId?: string;

  // Additional Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    originalFileName?: string;
    pageCount?: number;
    category?: string;
    customFields?: Record<string, any>;
    verificationRequirements?: string[];
  };

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;
}
