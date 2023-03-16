import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { ScheduleInteractor } from './interactors/schedule.interactor';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
  ) {}

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
      const interactor = new ScheduleInteractor(this.alerts);
      return await interactor.getScheduleForCurrentCalendar(page);
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student schedule for current calendar';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  async getScheduleForCalendar(calendar: string, page: Page) {
    try {
      const interactor = new ScheduleInteractor(this.alerts);
      return await interactor.getScheduleForCalendar(calendar, page);
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) throw e;
      await this.alerts.sendErrorAlert(page, e);
      return (
        'Something went wrong getting the student schedule for calendars ' +
        calendar
      );
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
