import { Repository } from 'typeorm';

import { Event } from './event.entity';
import { User } from './../auth/user.entity';
import { ListEvents } from './input/list.events';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { NotFoundException } from '@nestjs/common';

describe('EventsController', () => {
  let eventsService: EventsService;
  let eventsController: EventsController;
  let eventsRepository: Repository<Event>;

  beforeEach(() => {
    eventsService = new EventsService(eventsRepository);
    eventsController = new EventsController(eventsService);
  });

  it('Should return a list of events', async () => {
    const result = {
      first: 1,
      last: 1,
      limit: 10,
      data: [],
    };

    const spy = jest
      .spyOn(eventsService, 'getEventsWithAttendeeCountFilteredPaginated')
      .mockImplementation((): any => result);

    expect(await eventsController.findAll(new ListEvents())).toEqual(result);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("Should not delete an event, when it's not found", async () => {
    const deleteSpy = jest.spyOn(eventsService, 'deleteEvent');
    const findSpy = jest
      .spyOn(eventsService, 'findOne')
      .mockImplementation((): any => undefined);

    try {
      await eventsController.remove(1, new User());
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }

    expect(deleteSpy).toHaveBeenCalledTimes(0);
    expect(findSpy).toHaveBeenCalledTimes(1);
  });
});
