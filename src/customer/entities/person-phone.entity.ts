import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerPerson } from './customer-person.entity';

@Entity('person_phones')
export class PersonPhone {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => CustomerPerson, person => person.phoneNumbers)
  @JoinColumn({name: 'personId'})
  person: CustomerPerson;

  @Column({
    type: 'text',
    nullable: false
  })
  phone: string;
}
