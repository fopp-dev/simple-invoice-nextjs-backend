import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { User } from '../../user/entities/user.entity';

@Entity('log_application')
export class LogApplication {
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
    length: 50,
    nullable: false
  })
  applicationStep: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false
  })
  status: string;
}
