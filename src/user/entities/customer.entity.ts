import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from './partner.entity';
import { CustomerLoan } from '../../customer/entities/customer-loan.entity';
import { CustomerAsset } from '../../customer/entities/customer-asset.entity';
import { CustomerPerson } from '../../customer/entities/customer-person.entity';
import { CustomerDocument } from '../../customer/entities/customer-document.entity';
import { User } from './user.entity';
import { LogApplication } from '../../common/entities/log-application.entity';
import { Invoice } from '../../common/entities/invoice.entity';
import { Payment } from '../../common/entities/payment.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(type => User, users => users.customer)
  users: User[];

  @OneToMany(type => LogApplication, logs => logs.customer)
  logs: LogApplication[];

  @OneToMany(type => Invoice, invoices => invoices.customer)
  invoices: Invoice[];

  @OneToMany(type => Payment, payments => payments.customer)
  payments: Payment[];

  @ManyToOne(type => Partner)
  @JoinColumn({name: 'partnerId'})
  partner: Partner;

  @OneToMany(type => CustomerLoan, loans => loans.customer, {cascade: true})
  loans: number[];

  @OneToMany(type => CustomerAsset, assets => assets.customer, {cascade: true})
  assets: number[];

  @OneToMany(type => CustomerPerson, persons => persons.customer, {cascade: true})
  persons: CustomerPerson[];

  @OneToMany(type => CustomerDocument, documents => documents.customer, {cascade: true})
  documents: CustomerDocument[];

  @Column({
    type: 'text',
    nullable: true,
  })
  tradingName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  customerNumber: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  startYear: number;

  @Column({
    type: 'integer',
    nullable: true,
  })
  startMonth: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  annualSales: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  last3Months: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  suggestedCredit: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  openCreditLimit: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  approvedCreditLimit: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  registeredName: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  registrationNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  tinNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  vatNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  cityArea: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  street: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  blockNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  plotNumber: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  companyPhone: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  companyEmail: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  homepage: string;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  requestedCredit: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  lastSales: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  lastCostGoods: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  lastCostStaff: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  lastCostOther: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  currentSales: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  currentCostGoods: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  currentCostStaff: number;

  @Column({
    type: 'decimal',
    nullable: true,
    precision: 10,
    scale: 2,
  })
  currentCostOther: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  partnerComments: string;
}
