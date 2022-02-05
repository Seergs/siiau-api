import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AuthService } from 'src/auth/auth.service';
import { DiscordService } from 'src/discord/discord.service';
import { ScheduleInteractor } from './interactors/schedule.interactor';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly discordService: DiscordService,
  ) {}

  async getSchedule(request: Request, calendar: string) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('schedule', request.url);
    if (this.discordService.shouldSendDiscordMessage(request)) {
      this.discordService.sendMessage(
        'Hey! a request was made to ' + this.getSchedule.name,
      );
    }
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
