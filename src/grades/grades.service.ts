import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Page } from 'puppeteer';
import { AuthService } from 'src/auth/auth.service';
import { GradesInteractor } from './interactors/grades.interactor';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  constructor(private readonly authService: AuthService) {}

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

  async getGradesForCurrentCalendar(page: Page, selectedCareer: string) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCurrentCalendar(
        page,
        selectedCareer,
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
