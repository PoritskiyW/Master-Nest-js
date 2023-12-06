import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  when: Date;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  description: string;
}