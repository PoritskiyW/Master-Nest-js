import {
  Get,
  Param,
  Query,
  Controller,
  ParseIntPipe,
  UseInterceptors,
  SerializeOptions,
  DefaultValuePipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { EventsService } from './events.service';

@Controller('events-organized-by-user/:userId')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsOrganizedByUserController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1
  ) {
    return await this.eventsService.getEventsOrganizedByUserIdQueryPaginated(
      userId,
      {
        currentPage: page,
        limit: 5,
      }
    );
  }
}
