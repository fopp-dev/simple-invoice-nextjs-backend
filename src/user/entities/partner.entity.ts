import {
  Column,
  Entity, JoinColumn, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Customer } from './customer.entity';

@Entity('partners')
export class Partner {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(type => User, users => users.partner)
  users: User[];

  @OneToMany(type => Customer, customers => customers.partner, {cascade: true})
  customers: Customer[];

  @Column({
    type: 'varchar',
    length: 70,
    nullable: false
  })
  name: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  openCreditLimit: number;

  @Column({
    type: 'text',
  })
  paymentInstructions: string;
}
