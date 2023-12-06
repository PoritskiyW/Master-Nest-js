import { Event } from './event.entity';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { EventsController } from './events.controller';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: 'example',
    database: 'nest-events',
    entities: [Event],
    synchronize: true,
  }),
  TypeOrmModule.forFeature([Event])
],
  controllers: [AppController, EventsController],
  providers: [AppService],
})
export class AppModule {}
