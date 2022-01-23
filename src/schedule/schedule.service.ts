import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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

  async getSchedule(
    studentCode: string,
    studentNip: string,
    url: string,
    calendar: string,
  ) {
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('schedule', url);
    this.discordService.sendMessage(
      'Hey! a request was made to ' + this.getSchedule.name,
    );
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
