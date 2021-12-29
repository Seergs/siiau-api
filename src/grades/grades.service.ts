import {
	BadRequestException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {Page} from 'puppeteer';
import {GradesInteractor} from './interactors/grades.interactor';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  async getGrades(page: Page, calendar: string){
    if (calendar === 'current')
      return this.getGradesForCurrentCalendar(page);
    if (calendar !== undefined) {
      return this.getGradesForCalendar(calendar, page)
    }
    return this.getGradesForAllCalendars(page)
  }

  async getGradesForAllCalendars(page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForAllCalendars(page);
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student grades all calendars';
    }
  }

  async getGradesForCurrentCalendar(page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCurrentCalendar(page);
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student grades for current calendar';
    }
  }

  async getGradesForCalendar(calendar: string, page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCalendar(calendar, page);
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      if (e instanceof BadRequestException) throw e
      return 'Something went wrong getting the student grades for calendar ' + calendar;
    }
  }
}
