import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { CustomerPerson } from './customer-person.entity';

@Entity('customer_assets')
export class CustomerAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer, customer => customer.assets)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @ManyToOne(type => CustomerPerson, person => person.assets)
  @JoinColumn({name: 'personId'})
  person: number;

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
