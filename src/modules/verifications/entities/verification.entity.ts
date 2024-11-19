import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { VerificationStatus } from './verification-status.enum';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { User } from '@modules/users/entities/user.entity';
import { OrganizationUser } from '@modules/organizations/entities/organization-user.entity';

/**
 * Verification Entity represents the verification process of a document:
 * - Tracks who initiated the verification
 * - Which organization is verifying
 * - Status and history of the verification
 * - Blockchain integration for immutable verification records
 */
@Entity('verifications')
@Index(['document', 'organization']) // Index for quick lookups
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Document being verified
  @ManyToOne(() => Document, (document) => document.verifications)
  @JoinColumn({ name: 'document_id' })
  document: Document;

  @Column({ name: 'document_id' })
  documentId: string;

  // Organization performing verification
  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'organization_id' })
  organizationId: string;

  // User who submitted document for verification
  @ManyToOne(() => User)
  @JoinColumn({ name: 'initiated_by_id' })
  initiatedBy: User;

  @Column({ name: 'initiated_by_id' })
  initiatedById: string;

  // Organization user who reviewed the document
  @ManyToOne(() => OrganizationUser, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: OrganizationUser;

  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById?: string;

  // Verification Status
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  // Verification Details
  @Column({ type: 'text', nullable: true })
  comments?: string;

  @Column({ nullable: true })
  rejectionReason?: string;

  // Review Tracking
  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ type: 'int', default: 0 })
  reviewAttempts: number;

  // Blockchain Integration
  @Column({ nullable: true })
  blockchainTransactionId?: string;

  @Column({ type: 'jsonb', nullable: true })
  blockchainMetadata?: {
    networkId: string;
    contractAddress: string;
    verificationProof?: string;
    timestamp?: Date;
  };

  // Additional Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata?: {
    verificationMethod?: string;
    requiredDocuments?: string[];
    additionalInfo?: Record<string, any>;
    verificationChecklist?: Record<string, boolean>;
  };

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt?: Date;

  // Verification Process Tracking
  @Column({ nullable: true })
  assignedTo?: string; // OrganizationUser ID

  @Column({ type: 'jsonb', nullable: true })
  verificationSteps?: {
    step: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    completedAt?: Date;
    completedBy?: string;
    comments?: string;
  }[];
}
