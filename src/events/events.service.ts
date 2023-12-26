import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';

import { User } from './../auth/user.entity';
import { Event, PaginatedEvents } from './event.entity';
import { AttendeeAnswerEnum } from './attendee.entity';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { ListEvents, WhenEventFilter } from './input/list.events';
import { PaginateOptions, paginate } from './../pagination/paginator';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  private getEventsBaseQuery(): SelectQueryBuilder<Event> {
    return this.eventsRepository
      .createQueryBuilder('e')
      .orderBy('e.id', 'DESC');
  }

  private getEventsWithAttendeeCountQuery(): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap('e.attendeeCount', 'e.attendees')
      .loadRelationCountAndMap(
        'e.attendeeAccepted',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Accepted,
          })
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Rejected,
          })
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe',
        'e.attendees',
        'attendee',
        (qb) =>
          qb.where('attendee.answer = :answer', {
            answer: AttendeeAnswerEnum.Maybe,
          })
      );
  }

  private getEventsWithAttendeeCountFilteredQuery(
    filter?: ListEvents
  ): SelectQueryBuilder<Event> {
    const query = this.getEventsWithAttendeeCountQuery();

    if (!filter) {
      return query;
    }

    if (filter.when) {
      let where: string;
      switch (Number(filter.when)) {
        case WhenEventFilter.Today:
          where = `e.when >= CURDATE() AND e.when <= CURDATE() + INTERVAL 1 DAY`;

          break;

        case WhenEventFilter.Tomorrow:
          where = `e.when >= CURDATE() + INTERVAL 1 DAY AND e.when <= CURDATE() + INTERVAL 2 DAY`;

          break;

        case WhenEventFilter.ThisWeek:
          where = `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)`;

          break;

        case WhenEventFilter.NextWeek:
          where = `YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1`;

          break;
      }

      query.andWhere(where);
    }

    return query;
  }

  public async getEventsWithAttendeeCountFilteredPaginated(
    filter: ListEvents,
    paginateOptions: PaginateOptions
  ) {
    return await paginate(
      this.getEventsWithAttendeeCountFilteredQuery(filter),
      paginateOptions
    );
  }

  public async getEventWithAttendeeCount(
    id: number
  ): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery().andWhere(
      'e.id = :id',
      { id }
    );

    this.logger.debug(query.getSql);

    return await query.getOne();
  }

  public async findOne(id: number): Promise<Event | undefined> {
    return await this.eventsRepository.findOne({
      where: { id },
    });
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }

  public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...input,
        organizer: user,
        when: new Date(input.when),
      })
    );
  }

  public async updateEvent(
    event: Event,
    input: UpdateEventDto
  ): Promise<Event> {
    return await this.eventsRepository.save(
      new Event({
        ...event,
        ...input,
        when: input.when ? new Date(input.when) : event.when,
      })
    );
  }

  public async getEventsOrganizedByUserIdQueryPaginated(
    userId: number,
    paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsOrganizedByUserIdQuery(userId),
      paginateOptions
    );
  }

  private getEventsOrganizedByUserIdQuery(
    userId: number
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery().where('e.organizerId = :userId', {
      userId,
    });
  }

  public async getEventsAttendedByUserIdQueryPaginated(
    userId: number,
    paginateOptions: PaginateOptions
  ): Promise<PaginatedEvents> {
    return await paginate<Event>(
      this.getEventsAttendedByUserIdQuery(userId),
      paginateOptions
    );
  }

  private getEventsAttendedByUserIdQuery(
    userId: number
  ): SelectQueryBuilder<Event> {
    return this.getEventsBaseQuery()
      .leftJoinAndSelect('e.attendees', 'a')
      .where('a.userId = :userId', { userId });
  }
}
