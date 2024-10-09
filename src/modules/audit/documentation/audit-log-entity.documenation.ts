import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@modules/users/entities/user.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { AuditAction } from '../enums/audit-action.enum';

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['performedAt', 'action'])
@Index(['documentId', 'performedAt'])
export class AuditLog {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the audit log',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    enum: AuditAction,
    example: AuditAction.ACTIVATE_USER,
    description: 'The action performed in this audit log',
  })
  @Index()
  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @ApiProperty({
    example: 'User',
    description: 'The type of entity this audit log is about',
  })
  @Index()
  @Column({ length: 100 })
  entityType: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the entity this audit log is about',
  })
  @Index()
  @Column({ nullable: true })
  entityId?: string;

  @ApiPropertyOptional({
    type: () => User,
    description: 'The user who performed the action',
  })
  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy?: User;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who performed the action',
  })
  @Column({ nullable: true })
  performedById?: string;

  @ApiProperty({
    example: '2023-04-15T10:30:00Z',
    description: 'The date and time when the action was performed',
  })
  @Index()
  @CreateDateColumn()
  performedAt: Date;

  @ApiPropertyOptional({
    example: {
      oldValue: { status: 'PENDING' },
      newValue: { status: 'APPROVED' },
      reason: 'Document verified',
      additionalInfo: { verifier: 'John Doe' },
    },
    description: 'Additional metadata about the audit log',
  })
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    oldValue?: any;
    newValue?: any;
    reason?: string;
    additionalInfo?: any;
  };

  @ApiPropertyOptional({
    example: '192.168.1.1',
    description: 'The IP address from which the action was performed',
  })
  @Column({ nullable: true })
  ipAddress?: string;

  @ApiPropertyOptional({
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    description: 'The user agent of the client that performed the action',
  })
  @Column({ nullable: true })
  userAgent?: string;

  @ApiPropertyOptional({
    example: 'SUCCESS',
    description: 'The status of the action',
  })
  @Column({ nullable: true })
  status?: string;

  @ApiPropertyOptional({
    example: 'User profile updated with new email address',
    description: 'Additional details about the action',
  })
  @Column({ type: 'text', nullable: true })
  details?: string;

  @ApiPropertyOptional({
    type: () => Document,
    description: 'The associated document, if any',
  })
  @ManyToOne(() => Document, (document) => document.auditLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'documentId' })
  document?: Document;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the associated document',
  })
  @Index()
  @Column({ nullable: true })
  documentId?: string;

  @ApiPropertyOptional({
    type: () => Organization,
    description: 'The associated organization, if any',
  })
  @ManyToOne(() => Organization, (organization) => organization.auditLogs, {
    nullable: true,
  })
  @JoinColumn({ name: 'organizationId' })
  organization?: Organization;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the associated organization',
  })
  @Column({ nullable: true })
  organizationId?: string;

  @ApiPropertyOptional({
    example: '0x1234567890abcdef1234567890abcdef12345678',
    description: 'The blockchain transaction hash, if applicable',
  })
  @Column({ nullable: true })
  blockchainTransactionHash?: string;

  @ApiPropertyOptional({
    example: 12345678,
    description: 'The blockchain block number, if applicable',
  })
  @Column({ nullable: true })
  blockchainBlockNumber?: number;

  @ApiPropertyOptional({
    example: '2023-04-15T10:30:00Z',
    description: 'The blockchain timestamp, if applicable',
  })
  @Column({ nullable: true, type: 'timestamp' })
  blockchainTimestamp?: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'The version of the document, if applicable',
  })
  @Column({ nullable: true })
  documentVersion?: number;

  @ApiPropertyOptional({
    example: 1,
    description:
      "The sequence number for chronological ordering within a document's history",
  })
  @Index()
  @Column({ type: 'integer', nullable: true })
  sequenceNumber?: number;
}
