import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum LoginStatus {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, (user) => user.loginHistory, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: LoginStatus,
  })
  status: LoginStatus;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  timestamp: Date;
}
