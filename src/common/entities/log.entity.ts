import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('logs')
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false
  })
  refTable: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false
  })
  refColumn: string;

  @Column({
    type: 'integer',
    nullable: false
  })
  refId: number;

  @Column({
    type: 'datetime',
    nullable: false
  })
  time: string;

  @Column({
    type: 'text',
    nullable: true
  })
  changeFrom: string;

  @Column({
    type: 'text',
    nullable: true
  })
  changeTo: string;
}
