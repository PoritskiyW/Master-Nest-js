import { DeleteResult, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { PaginateOptions, paginate } from "src/pagination/paginator";

import { Event } from "./event.entity";
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";

@Injectable()
export class EventsService {

  private readonly logger = new Logger(EventsService.name)

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>
  ) {}

  private getEventsBaseQuery() {
    return this.eventsRepository
    .createQueryBuilder('e')
    .orderBy('e.id', 'DESC');
  }
  
  private getEventsWithAttendeeCountQuery() {
    return this.getEventsBaseQuery()
      .loadRelationCountAndMap(
        'e.attendeeCount', 'e.attendees'
      )
      .loadRelationCountAndMap(
        'e.attendeeAccepted', 
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Accepted }
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeRejected', 
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Rejected }
          )
      )
      .loadRelationCountAndMap(
        'e.attendeeMaybe', 
        'e.attendees',
        'attendee',
        (qb) => qb
          .where(
            'attendee.answer = :answer',
            { answer: AttendeeAnswerEnum.Maybe }
          )
      );
  }

  private getEventsWithAttendeeCountFiltered(filter?: ListEvents) {
    let query = this.getEventsWithAttendeeCountQuery();

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
      this.getEventsWithAttendeeCountFiltered(filter),
      paginateOptions
    )
  }

  public async getEvent(id: number): Promise<Event | undefined> {
    const query = this.getEventsWithAttendeeCountQuery()
      .andWhere('e.id = :id', { id })

    this.logger.debug(query.getSql);

    return await query.getOne();
  }

  public async deleteEvent(id: number): Promise<DeleteResult> {
    return await this.eventsRepository
      .createQueryBuilder('e')
      .delete()
      .where('id = :id', { id })
      .execute();
  }
}