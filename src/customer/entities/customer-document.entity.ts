import {
  BeforeInsert, BeforeUpdate,
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { CustomerPerson } from './customer-person.entity';
import { User } from '../../user/entities/user.entity';
import { CUSTOMER_REGISTRATION_STEPS } from '../../constant';

@Entity('customer_documents')
export class CustomerDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: number;

  @ManyToOne(type => CustomerPerson)
  @JoinColumn({name: 'personId'})
  person: number;

  @ManyToOne(type => User)
  @JoinColumn({name: 'checkedByUserId'})
  checkedByUser: User;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameOriginal: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filename: string;

  @Column({
    type: 'varchar',
    length: 70,
    nullable: false,
    default: CUSTOMER_REGISTRATION_STEPS['2_SUBMIT_APPLICATION']
  })
  applicationStep: string;

  @Column({
    type: 'boolean',
    default: false
  })
  checked: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  checkedTime: string;
}
