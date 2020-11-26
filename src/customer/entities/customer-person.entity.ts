import {
  Column,
  Entity, JoinColumn, ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../user/entities/customer.entity';
import { CustomerAsset } from './customer-asset.entity';
import { PersonPhone } from './person-phone.entity';
import { CustomerDocument } from './customer-document.entity';

@Entity('customer_persons')
export class CustomerPerson {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Customer)
  @JoinColumn({name: 'customerId'})
  customer: Customer;

  @OneToMany(type => CustomerAsset, assets => assets.person, {cascade: true})
  assets: CustomerAsset[];

  @OneToMany(type => PersonPhone, phoneNumbers => phoneNumbers.person, {cascade: true})
  phoneNumbers: PersonPhone[];

  @OneToMany(type => CustomerDocument, documents => documents.person, {cascade: true})
  documents: CustomerDocument[];

  @Column({
    type: 'varchar',
    length: 20,
    nullable: false
  })
  role: string;

  @Column({
    type: 'integer',
    nullable: true
  })
  ownershipShare: number;

  @Column({
    type: 'text',
    nullable: false
  })
  firstName: string;

  @Column({
    type: 'text',
    nullable: false
  })
  lastName: string;

  @Column({
    type: 'text',
    nullable: false
  })
  nationalId: string;

  @Column({
    type: 'varchar',
    length: 70,
    nullable: false
  })
  email: string;

  @Column({
    type: 'text',
    nullable: false
  })
  cityArea: string;

  @Column({
    type: 'text',
    nullable: false
  })
  street: string;

  @Column({
    type: 'text',
    nullable: true
  })
  blockNumber: string;

  @Column({
    type: 'text',
    nullable: true
  })
  plotNumber: string;

  @Column({
    type: 'text',
    nullable: true
  })
  emergency: string;
}
