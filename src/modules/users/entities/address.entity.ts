import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from '@modules/organizations/entities/organization.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.address)
  @JoinColumn()
  user: User;

  @OneToOne(() => Organization, (organization) => organization.address)
  @JoinColumn()
  organization: Organization;

  @Column({ nullable: true, length: 255 })
  streetAddress?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column({ nullable: true, length: 100 })
  state?: string;

  @Column({ nullable: true, length: 100 })
  country?: string;

  @Column({ nullable: true, length: 20 })
  postalCode?: string;

  @Column({ nullable: true, length: 100 })
  region?: string;

  @Column({ nullable: true, length: 100 })
  zone?: string;

  @Column({ nullable: true, length: 100 })
  subCity?: string;

  @Column({ nullable: true, length: 100 })
  woreda?: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber?: string;
}
