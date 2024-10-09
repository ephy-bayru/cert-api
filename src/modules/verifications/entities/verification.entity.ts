import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { VerificationStatus } from './verification-status.enum';
import { Organization } from '@modules/organizations/entities/organization.entity';
import { Document } from '@modules/documents/entities/document.entity';
import { User } from '@modules/users/entities/user.entity';

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, (document) => document.verifications)
  document: Document;

  @ManyToOne(
    () => Organization,
    (organization) => organization.verificationRequests,
  )
  organization: Organization;

  @ManyToOne(() => User, (user) => user.verifications)
  initiatedBy: User;

  @ManyToOne(() => User, (user) => user.verificationsReviewed, {
    nullable: true,
  })
  reviewedBy?: User;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  comments?: string;

  @Column({ nullable: true })
  blockchainTransactionId?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt?: Date;

  @Column({ nullable: true })
  rejectionReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
