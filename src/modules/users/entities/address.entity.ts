import { Column } from 'typeorm';

export class Address {
  @Column({ nullable: true, length: 255 })
  streetAddress?: string;

  @Column({ nullable: true, length: 100 })
  city?: string;

  @Column({ nullable: true, length: 100 })
  state?: string;

  @Column({ nullable: true, length: 20 })
  postalCode?: string;

  @Column({ nullable: true, length: 100 })
  country?: string;
}
