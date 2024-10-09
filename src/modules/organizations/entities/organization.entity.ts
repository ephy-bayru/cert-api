import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToMany,
  Unique,
  JoinTable,
  OneToOne,
  Index,
} from 'typeorm';
import { OrganizationStatus } from './organization-status.enum';
import { Document } from '@modules/documents/entities/document.entity';
import { Address } from '@modules/users/entities/address.entity';
import { User } from '@modules/users/entities/user.entity';
import { Notification } from '@modules/notifications/entities/notification.entity';
import { Verification } from '@modules/verifications/entities/verification.entity';
import { AuditLog } from '@modules/audit/entities/audit-log.entity';

@Entity('organizations')
@Unique(['name'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true, length: 200 })
  name: string;

  @Column({ nullable: true, length: 150 })
  contactEmail?: string;

  @Column({ nullable: true, length: 20 })
  contactPhoneNumber?: string;

  @Column({ nullable: true, length: 100 })
  industry?: string;

  @Column({ type: 'date', nullable: true })
  foundedDate?: Date;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Index()
  @Column({ nullable: true, unique: true, length: 100 })
  blockchainAddress?: string;

  @Index()
  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.PENDING_APPROVAL,
  })
  status: OrganizationStatus;

  @OneToOne(() => Address, (address) => address.organization)
  address: Address;

  @ManyToMany(() => User, (user) => user.organizations)
  users: User[];

  @OneToMany(() => Document, (document) => document.verifiedByOrganization)
  verifiedDocuments: Document[];

  @OneToMany(() => Notification, (notification) => notification.organization)
  notifications: Notification[];

  @ManyToMany(() => User, (user) => user.adminOrganizations)
  @JoinTable({
    name: 'organization_admins',
    joinColumn: { name: 'organization_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  adminUsers: User[];

  @OneToMany(() => Verification, (verification) => verification.organization)
  verificationRequests: Verification[];

  @ManyToMany(() => Document, (document) => document.verificationRequests)
  requestedDocuments: Document[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.organization)
  auditLogs: AuditLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
