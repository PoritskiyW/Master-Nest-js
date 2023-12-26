import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { User } from './../auth/user.entity';
import { Event } from './../events/event.entity';
import { Profile } from './../auth/profile.entity';
import { Subject } from './../school/subject.entity';
import { Teacher } from './../school/teacher.entity';
import { Attendee } from './../events/attendee.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE_NAME,
    entities: [Event, Attendee, Subject, Teacher, User, Profile],
    synchronize: false,
  })
);
