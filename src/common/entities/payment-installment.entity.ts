import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {InvoiceInstallment} from './invoice-installment.entity';
import { Payment } from './payment.entity';

@Entity('payment_installments')
export class PaymentInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => InvoiceInstallment, invoiceInstallment => invoiceInstallment.paymentInstallments, {cascade: true})
  @JoinColumn({name: 'invoiceInstallmentId'})
  invoiceInstallment: InvoiceInstallment;

  @ManyToOne(type => Payment)
  @JoinColumn({name: 'paymentId'})
  payment: Payment;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;
}
