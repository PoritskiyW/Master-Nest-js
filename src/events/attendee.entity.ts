import { Expose } from 'class-transformer';
import {
  Column,
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Event } from './event.entity';
import { User } from './../auth/user.entity';

export enum AttendeeAnswerEnum {
  Accepted = 1,
  Maybe,
  Rejected,
}

@Entity()
export class Attendee {
  @PrimaryGeneratedColumn()
  @Expose()
  id: number;

  @Column('enum', {
    enum: AttendeeAnswerEnum,
    default: AttendeeAnswerEnum.Accepted,
  })
  @Expose()
  answer: AttendeeAnswerEnum;

  @ManyToOne(() => Event, (event) => event.attendees, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  event: Event;

  @Column()
  eventId: number;

  @ManyToOne(() => User)
  @Expose()
  user: User;

  @Column()
  userId: number;
}
