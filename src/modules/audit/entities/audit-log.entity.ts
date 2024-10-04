import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { AuditAction } from '../enums/audit-action.enum';

@Entity('audit_logs')
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
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performedById' })
  performedBy?: User;

  @Column({ nullable: true })
  performedById?: string;

  @Index()
  @CreateDateColumn()
  performedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  status: string;

  @Column({ type: 'text', nullable: true })
  details: string;
}
