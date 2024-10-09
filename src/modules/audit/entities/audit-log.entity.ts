import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { AuditAction } from '../enums/audit-action.enum';

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['performedAt', 'action'])
@Index(['documentId', 'performedAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Index()
  @Column({ length: 100 })
  entityType: string;

  @Index()
  @Column({ nullable: true })
  entityId?: string;

  @Index()
  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy?: User;

  @Column({ nullable: true })
  performedById?: string;

  @Index()
  @CreateDateColumn()
  performedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    oldValue?: any;
    newValue?: any;
    reason?: string;
    additionalInfo?: any;
    changedFields?: string[];
  };

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  status?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @ManyToOne(() => Document, (document) => document.auditLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'documentId' })
  document?: Document;

  @Index()
  @Column({ nullable: true })
  documentId?: string;

  @ManyToOne(() => Organization, (organization) => organization.auditLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  blockchainTransactionHash?: string;

  @Column({ nullable: true })
  blockchainBlockNumber?: number;

  @Column({ nullable: true, type: 'timestamp' })
  blockchainTimestamp?: Date;

  @Column({ nullable: true })
  documentVersion?: number;

  @Index()
  @Column({ type: 'integer', nullable: true })
  sequenceNumber?: number;

  @Column({ type: 'jsonb', nullable: true })
  verificationDetails?: {
    verifiedByOrganizationIds?: string[];
    verificationStatus?: string;
    verificationComments?: string;
  };

  @Column({ nullable: true })
  previousStatus?: string;

  @Column({ nullable: true })
  newStatus?: string;
}
