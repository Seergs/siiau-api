import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { ScheduleInteractor } from './interactors/schedule.interactor';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(private readonly authService: AuthService) {}

  async getSchedule(request: Request, calendar: string) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    if (!calendar) {
      return this.getCurrentSchedule(page);
    }
    return this.getScheduleForCalendar(calendar, page);
  }

  async getCurrentSchedule(page: Page) {
    try {
      const schedule = await ScheduleInteractor.getScheduleForCurrentCalendar(
        page,
      );
      await page.close();
      return schedule;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student schedule for current calendar';
    }
  }

  async getScheduleForCalendar(calendar: string, page: Page) {
    try {
      const schedule = await ScheduleInteractor.getScheduleForCalendar(
        calendar,
        page,
      );
      await page.close();
      return schedule;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) throw e;
      return (
        'Something went wrong getting the student schedule for calendars ' +
        calendar
      );
    }
  }
}
