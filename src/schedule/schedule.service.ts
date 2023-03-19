import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { ScheduleInteractor } from './interactors/schedule.interactor';
import { AlertService } from 'src/alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';

@Injectable()
export class ScheduleService {
  private readonly logger = new Logger(ScheduleService.name);
  private readonly cacheSuffix = 'schedule';

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly cache: CacheClient,
  ) {}

  async getSchedule(request: Request, calendar: string) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    if (!calendar) {
      const cacheKey = `${studentCode}-${this.cacheSuffix}-current`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        return JSON.parse(cached);
      }
      this.logger.debug('Returning fresh data');
      const data = await this.getCurrentSchedule(page);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    }
    const cacheKey = `${studentCode}-${this.cacheSuffix}-${calendar}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached data');
      return JSON.parse(cached);
    }
    this.logger.debug('Returning fresh data');
    const data = await this.getScheduleForCalendar(calendar, page);
    await this.cache.set(cacheKey, JSON.stringify(data));
    return data;
  }

  async getCurrentSchedule(page: Page) {
    try {
      const interactor = new ScheduleInteractor(this.alerts);
      return await interactor.getScheduleForCurrentCalendar(page);
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      throw new InternalServerErrorException(
        'Something went wrong getting the student schedule for current calendar',
      );
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
      throw new InternalServerErrorException(
        'Something went wrong getting the student schedule for calendars ' +
          calendar,
      );
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
