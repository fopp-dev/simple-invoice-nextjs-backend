import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { InvoiceInstallment } from './invoice-installment.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @OneToMany(type => InvoiceInstallment, installments => installments.invoice, {cascade: true}) // cascade true can make save with nested object
  installments: InvoiceInstallment[];

  @Column({
    type: 'datetime',
    nullable: false
  })
  date: string;

  @Column({
    type: 'text',
    nullable: false
  })
  invoiceNumber: string;

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
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameInvoice: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameInvoiceOriginal: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameExcel: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameExcelOriginal: string;
}
