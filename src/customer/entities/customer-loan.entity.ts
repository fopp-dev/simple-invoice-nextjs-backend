import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';

@Entity('customer_loans')
export class CustomerLoan {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer, customer => customer.loans)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @Column({
    type: 'text',
    nullable: false
  })
  name: string;

  @Column({
    type: 'decimal',
    nullable: false,
    precision: 10,
    scale: 2
  })
  value: number;

  @Column({
    type: 'text',
    nullable: true
  })
  detail: string;
}
