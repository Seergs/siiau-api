import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiHeaders, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import { GradesService } from './grades.service';
import { RootResponse, RootHeaders, RootQuery } from './swagger';

@ApiTags('grades')
@Controller(['grades', 'kardex'])
export class GradesController {
  constructor(
    private readonly gradesService: GradesService,
    private readonly databaseService: DatabaseService,
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @ApiQuery(RootQuery)
  @Get()
  async getGrades(
    @Query() query: Record<string, any>,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const puppeteerPage = response.locals.page as Page;
    await this.databaseService.save('grades', request.url);
    const calendars = query['calendar'];
    const parsedCalendars = this.parseCalendars(calendars);
    return this.gradesService.getGrades(puppeteerPage, parsedCalendars);
  }

  private parseCalendars(receivedCalendars: string) {
    if (!receivedCalendars) {
      // dont throw error, if no calendar specified, then return all calendars
      return;
    }

    // If it is for the current calendar, then it's all good
    if (receivedCalendars === 'current') return [receivedCalendars];

    let calendars: string[] = [];
    const calendarsUppercase = receivedCalendars.toUpperCase();
    const calendarsArray = calendarsUppercase.split(',');
    for (const c of calendarsArray) {
      calendars.push(this.parseCalendar(c));
    }
    return calendars;
  }

  private parseCalendar(calendar: string) {
    // possible values for semester: 17B, 17-B, 17 B, 2017B, 2017 B, 2017-B
    // return should look like '17 B'

    // 17 B is already a parsed calendar
    if (/^\d{2} [a-zA-Z]$/.test(calendar)) {
      return calendar;
    }

    // 17B validation and parsing
    if (/^\d{2}[a-zA-Z]$/.test(calendar)) {
      return calendar.match(/.{1,2}/g).join(' ');
    }

    // 17-B validation and parsing
    if (/^\d{2}-[a-zA-Z]$/.test(calendar)) {
      return calendar.replace('-', ' ');
    }

    // 2017B validation and parsing
    if (/^\d{4}[a-zA-Z]$/.test(calendar)) {
      const parts = calendar.match(/.{1,2}/g);
      return `${parts[1]} ${parts[2]}`;
    }

    // 2017-B validation and parsing
    if (/^\d{4}-[a-zA-Z]$/.test(calendar)) {
      const plainCalendar = calendar.replace('-', '');
      const parts = plainCalendar.match(/.{1,2}/g);
      return `${parts[1]} ${parts[2]}`;
    }

    // 2017 B validation and parsing
    if (/^\d{4} [a-zA-Z]$/.test(calendar)) {
      const plainCalendar = calendar.replace(' ', '');
      const parts = plainCalendar.match(/.{1,2}/g);
      return `${parts[1]} ${parts[2]}`;
    }

    throw new BadRequestException(
      'Invalid calendar format, examples of possible values for calendar are: 17B, 17-B, 17 B, 2017B, 2017-B, 2017 B',
    );
  }
}
