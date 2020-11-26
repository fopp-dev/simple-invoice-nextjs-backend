import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { PaymentInstallment } from './payment-installment.entity';

@Entity('invoice_installments')
export class InvoiceInstallment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Invoice)
  @JoinColumn({name: 'invoiceId'})
  invoice: Invoice;

  @OneToMany(type => PaymentInstallment, paymentInstallments => paymentInstallments.invoiceInstallment)
  paymentInstallments: PaymentInstallment[];

  @Column({
    type: 'datetime',
    nullable: false
  })
  date: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  remaining: number;

  @Column({
    type: 'text',
    nullable: true
  })
  comment: string;
}
