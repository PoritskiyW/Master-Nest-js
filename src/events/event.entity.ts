import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Attendee } from './attendee.entity';

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

  @OneToMany(() => Attendee, (attendee) => attendee.event, {
    cascade: true,
  })
  attendees: Attendee[];

  attendeeCount?: number;

  attendeeRejected?: number;

  attendeeMaybe?: number;
  
  attendeeAccepted?: number;
}
