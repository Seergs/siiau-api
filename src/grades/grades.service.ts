import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { GradesInteractor } from './interactors/grades.interactor';
import { AlertService } from 'src/alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);
  private readonly cacheSuffix = 'grades';

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly cache: CacheClient,
  ) {}

  async getGrades(
    request: Request,
    calendars: string[],
    selectedCareer: string,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    if (!calendars) {
      const cacheKey = `${studentCode}-${this.cacheSuffix}-all`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        return JSON.parse(cached);
      }
      this.logger.debug('Returning fresh data');
      const data = await this.getGradesForAllCalendars(page);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    }
    if (calendars.length === 1 && calendars[0] === 'current') {
      const cacheKey = `${studentCode}-${this.cacheSuffix}-current`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        return JSON.parse(cached);
      }
      this.logger.debug('Returning fresh data');
      const data = await this.getGradesForCurrentCalendar(page, selectedCareer);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    }
    const cacheKey = `${studentCode}-${this.cacheSuffix}-${calendars.join(
      '-',
    )}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached data');
      return JSON.parse(cached);
    }
    this.logger.debug('Returning fresh data');
    const data = await this.getGradesForCalendars(calendars, page);
    await this.cache.set(cacheKey, JSON.stringify(data));
    return data;
  }

  async getGradesForAllCalendars(page: Page) {
    try {
      const interactor = new GradesInteractor(this.alerts);
      return await interactor.getStudentGradesForAllCalendars(page);
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student grades all calendars';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  async getGradesForCurrentCalendar(page: Page, selectedCareer: string) {
    try {
      const interactor = new GradesInteractor(this.alerts);
      return await interactor.getStudentGradesForCurrentCalendar(
        page,
        selectedCareer,
      );
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student grades for current calendar';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  async getGradesForCalendars(calendars: string[], page: Page) {
    try {
      const interactor = new GradesInteractor(this.alerts);
      return await interactor.getStudentGradesForCalendars(calendars, page);
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) throw e;
      await this.alerts.sendErrorAlert(page, e);
      return (
        'Something went wrong getting the student grades for calendars ' +
        calendars
      );
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
