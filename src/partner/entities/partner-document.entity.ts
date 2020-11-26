import {
  Column,
  Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from '../../user/entities/partner.entity';

@Entity('partner_documents')
export class PartnerDocument {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Partner)
  @JoinColumn({name: 'partnerId'})
  partner: Partner;

  @Column({
    type: 'text',
    nullable: false
  })
  name: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filename: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false
  })
  filenameOriginal: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true
  })
  type: string;
}
