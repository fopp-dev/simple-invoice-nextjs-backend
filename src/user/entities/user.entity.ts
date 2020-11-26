import {
  BeforeInsert,
  Column,
  Entity,
  JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { config } from '../../config';
import { Partner } from './partner.entity';
import { Customer } from './customer.entity';

export enum Role {
  customer = 'customer',
  partner = 'partner',
  mtaji_local_admin = 'mtaji local admin',
  mtaji_local_credit = 'mtaji local credit',
  mtaji_global_credit = 'mtaji global credit',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Partner, partner => partner.users)
  @JoinColumn({name: 'partnerId'})
  partner: Partner;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @Column({
    type: 'varchar',
    length: 70,
    unique: true,
    nullable: false
  })
  email: string;

  @Column({
    type: 'text',
    nullable: false
  })
  name: string;

  @Column({
    type: 'text',
    nullable: false
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.customer
  })
  role: string;

  @Column({
    type: 'boolean',
    default: false
  })
  enabled: boolean;

  @BeforeInsert()
  async beforeInsert() {
    const salt = await bcrypt.genSalt(config.auth.passwordLength);
    this.password = await bcrypt.hash(this.password, salt);
  }
}
