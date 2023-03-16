import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { GradesInteractor } from './interactors/grades.interactor';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
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
      return this.getGradesForAllCalendars(page);
    }
    if (calendars.length === 1 && calendars[0] === 'current') {
      return this.getGradesForCurrentCalendar(page, selectedCareer);
    }
    return this.getGradesForCalendars(calendars, page);
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
