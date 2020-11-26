import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { User } from '../../user/entities/user.entity';

@Entity('log_credit_limit')
export class LogCreditLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @ManyToOne(type => User)
  @JoinColumn({name: 'userId'})
  user: User;

  @Column({
    type: 'datetime',
    nullable: false
  })
  time: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  type: string; // change or soft close

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  changeFrom: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  changeTo: number;

  @Column({
    type: 'text',
    nullable: true
  })
  comment: string;

}
