import {
  Get,
  Body,
  Post,
  Patch,
  Param,
  Query,
  Delete,
  UsePipes,
  HttpCode,
  UseGuards,
  Controller,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  SerializeOptions,
  NotFoundException,
  ForbiddenException,
  ClassSerializerInterceptor,
} from '@nestjs/common';

import { User } from 'src/auth/user.entity';
import { EventsService } from './events.service';
import { ListEvents } from './input/list.events';
import { AuthGuardJwt } from 'src/auth/auth-guard.jwt';
import { CreateEventDto } from './input/create-event.dto';
import { UpdateEventDto } from './input/update-event.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('/events')
@SerializeOptions({ strategy: 'excludeAll' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    const events =
      await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
        filter,
        {
          total: true,
          currentPage: filter.page,
          limit: 10,
        }
      );

    return events;
  }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id) {
    const event = await this.eventsService.getEventWithAttendeeCount(id);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @Post()
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(@Body() input: CreateEventDto, @CurrentUser() user: User) {
    return await this.eventsService.createEvent(input, user);
  }

  @Patch(':id')
  @UseGuards(AuthGuardJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizer.id !== user.id) {
      throw new ForbiddenException(
        null,
        'You are not authorized to change this event'
      );
    }

    return await this.eventsService.updateEvent(event, input);
  }

  @Delete(':id')
  @UseGuards(AuthGuardJwt)
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id, @CurrentUser() user: User) {
    const event = await this.eventsService.findOne(id);

    if (!event) {
      throw new NotFoundException();
    }

    if (event.organizer.id !== user.id) {
      throw new ForbiddenException(
        null,
        'You are not authorized to remove this event'
      );
    }

    await this.eventsService.deleteEvent(id);
  }
}
