import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { GradesInteractor } from './interactors/grades.interactor';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  async getGrades(page: Page, calendars: string[]) {

    if (!calendars) {
      return this.getGradesForAllCalendars(page);
    }
    if (calendars.length === 1 && calendars[0] === 'current') {
      return this.getGradesForCurrentCalendar(page);
    }
    return this.getGradesForCalendars(calendars, page);
  }

  async getGradesForAllCalendars(page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForAllCalendars(
        page,
      );
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student grades all calendars';
    }
  }

  async getGradesForCurrentCalendar(page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCurrentCalendar(
        page,
      );
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student grades for current calendar';
    }
  }

  async getGradesForCalendars(calendars: string[], page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCalendars(
        calendars,
        page,
      );
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) throw e;
      return (
        'Something went wrong getting the student grades for calendars ' +
        calendars
      );
    }
  }
}
