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
} from 'typeorm';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { User } from '@modules/users/entities/user.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';
import { DocumentStatus } from './document-status.enum';

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  fileUrl: string; // Encrypted file URL or path

  @Index()
  @Column()
  fileHash: string; // SHA-256 hash of the document

  @Column({ type: 'bigint' })
  fileSize: number;

  @Index()
  @Column({ length: 100 })
  fileType: string;

  @Index()
  @Column({ nullable: true, length: 100 })
  documentType?: string;

  @Column({ type: 'date', nullable: true })
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

  @OneToMany(() => AuditLog, (auditLog) => auditLog.document)
  auditLogs: AuditLog[];

  @Column({ nullable: true })
  latestAuditLogId?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  blockchainTxHash?: string;

  @VersionColumn()
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  submittedAt?: Date;

  @Column({ nullable: true })
  lastVerifiedAt?: Date;

  @Column({ nullable: true })
  revokedAt?: Date;

  @Column({ nullable: true })
  archivedAt?: Date;
}
