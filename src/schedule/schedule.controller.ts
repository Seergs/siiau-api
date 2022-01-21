import { Request } from 'express';
import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ScheduleService } from './schedule.service';
import { RootResponse, RootHeaders, RootQuery } from './swagger';
import { ApiHeaders, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly scheduleService: ScheduleService,
    private readonly authService: AuthService
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @ApiQuery(RootQuery)
  @Get()
  async getSchedule(
    @Query() query: Record<string, any>,
    @Req() request: Request,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.databaseService.save('schedule', request.url);
    const calendar = query['calendar'];
    const parsedCalendar = this.parseCalendar(calendar);
    return this.scheduleService.getSchedule(page, parsedCalendar);
  }

  private parseCalendar(receivedCalendar: string) {
    if (!receivedCalendar) {
      // dont throw error, if no calendar specified, then return all calendars
      return;
    }

    const calendarUppercase = receivedCalendar.toUpperCase();
    // possible values for semester: 17B, 17-B, 17 B, 2017B, 2017 B, 2017-B
    // return should look like '201720'

    const AorB = this.parseAandB(calendarUppercase[calendarUppercase.length - 1]);

    // 17 B, 17B, 17-B validation and parsing
    if (
      /^\d{2} [a-zA-Z]$/.test(calendarUppercase) ||
      /^\d{2}[a-zA-Z]$/.test(calendarUppercase) ||
      /^\d{2}-[a-zA-Z]$/.test(calendarUppercase)
    ) {
      return `20${calendarUppercase.slice(0, 2)}${AorB}`;
    }

    // 2017B, 2017-B, 2017 B validation and parsing
    if (
      /^\d{4}[a-zA-Z]$/.test(calendarUppercase) ||
      /^\d{4}-[a-zA-Z]$/.test(calendarUppercase) ||
      /^\d{4} [a-zA-Z]$/.test(calendarUppercase)
    ) {
      return `${calendarUppercase.slice(0, 4)}${AorB}`;
    }

    throw new BadRequestException(
      'Invalid calendar format, examples of possible values for calendar are: 17B, 17-B, 17 B, 2017B, 2017-B, 2017 B',
    );
  }

  private parseAandB(AorB: string) {
    if (AorB == 'A') return '10';
    return '20';
  }
}
