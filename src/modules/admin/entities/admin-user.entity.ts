import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { GlobalRole } from '@common/enums/global-role.enum';

@Entity('admin_users')
export class AdminUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150, unique: true })
  email: string;

  @Column()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ nullable: true, length: 100 })
  firstName?: string;

  @Column({ nullable: true, length: 100 })
  lastName?: string;

  @Column({ nullable: true, length: 100 })
  phoneNumber?: string;

  @Column({
    type: 'enum',
    enum: GlobalRole,
    default: GlobalRole.PLATFORM_ADMIN,
  })
  role: GlobalRole;

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ default: 0 })
  failedLoginAttempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @Column({ type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ type: 'uuid', nullable: true })
  deletedBy?: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;
}
