import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { PaymentInstallment } from './payment-installment.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @OneToMany(type => PaymentInstallment, paymentInstallments => paymentInstallments.payment, {cascade: true})
  paymentInstallments: PaymentInstallment[];

  @Column({
    type: 'datetime',
    nullable: false
  })
  date: string;

  @Column({
    type: 'text',
    nullable: false
  })
  account: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

}
