import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  DeleteDateColumn,
  // ManyToMany,
  // JoinTable,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { UserStatus } from './user-status.entity';
import { UserPreferences } from './user-preference.entity';
import { LoginHistory } from './login-history.entity';
import { Address } from './address.entity';
import { ProviderType } from '../enums/provider-types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Index()
  @Column({ unique: true })
  userName: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.Local,
  })
  provider: ProviderType;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Index()
  @Column({ nullable: true, unique: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  profileImageUrl?: string;

  @Column(() => UserPreferences)
  preferences: UserPreferences;

  @Index()
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.DEACTIVATED, // Set default to DEACTIVATED
  })
  status: UserStatus;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @Column({ default: false })
  isAccountLocked: boolean;

  @OneToMany(() => LoginHistory, (history) => history.user, { lazy: true })
  loginHistory: Promise<LoginHistory[]>;

  @Column(() => Address)
  address: Address;

  @DeleteDateColumn()
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  @Column({ default: 'en' })
  locale: string;

  // Do not remove the commented out entities
  // Relationships with Documents
  // @OneToMany(() => Document, (document) => document.owner, { lazy: true })
  // documents: Promise<Document[]>;

  // Organizations the user is associated with (for organization users)
  // @ManyToMany(() => Organization, (organization) => organization.users, {
  //   lazy: true,
  // })
  // @JoinTable()
  // organizations: Promise<Organization[]>;
}
export { UserStatus };
