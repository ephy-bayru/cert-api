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

@Entity('documents')
@Check(`"file_size" > 0`)
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  @Index()
  @Column({ nullable: true, length: 100, name: 'document_type' })
  documentType?: string;

  @Column({ type: 'date', nullable: true, name: 'expiry_date' })
  expiryDate?: Date;

  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Index()
  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @ManyToOne(() => User, (user) => user.documents)
  owner: User;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.uploadedDocuments)
  uploader: User;

  @Column({ name: 'uploader_id' })
  uploaderId: string;

  @ManyToOne(() => Organization, (org) => org.uploadedDocuments, {
    nullable: true,
  })
  uploadingOrganization: Organization;

  @Column({ name: 'uploading_organization_id', nullable: true })
  uploadingOrganizationId: string;

  @ManyToMany(() => User, (user) => user.accessibleDocuments)
  @JoinTable({
    name: 'document_user_access',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  usersWithAccess: User[];

  @ManyToMany(() => Organization, (org) => org.accessibleDocuments)
  @JoinTable({
    name: 'document_organization_access',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  organizationsWithAccess: Organization[];

  @ManyToMany(
    () => Organization,
    (organization) => organization.requestedDocuments,
  )
  @JoinTable({
    name: 'document_verification_requests',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  verificationRequests: Organization[];

  @OneToMany(() => Verification, (verification) => verification.document)
  verifications: Verification[];

  @ManyToMany(
    () => Organization,
    (organization) => organization.verifiedDocuments,
  )
  @JoinTable({
    name: 'document_verifications',
    joinColumn: { name: 'document_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'organization_id', referencedColumnName: 'id' },
  })
  verifiedByOrganizations: Organization[];

  @Column({ type: 'jsonb', nullable: true, name: 'verification_statuses' })
  verificationStatuses?: Record<string, DocumentStatus>; // organizationId: status

  @OneToMany(() => AuditLog, (auditLog) => auditLog.document)
  auditLogs: AuditLog[];

  @Column({ nullable: true, name: 'latest_audit_log_id' })
  latestAuditLogId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true, name: 'blockchain_tx_hash' })
  blockchainTxHash?: string;

  @VersionColumn()
  version: number;

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

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;
}
