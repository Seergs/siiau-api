import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {Page} from 'puppeteer';
import {GradesInteractor} from './interactors/grades.interactor';

@Injectable()
export class GradesService {
  private readonly logger = new Logger(GradesService.name);

  async getGrades(page: Page, semester: string){
    if (semester === 'current')
      return this.getCurrentSemesterGrades(page);
  }

  async getCurrentSemesterGrades(page: Page) {
    try {
      const grades = await GradesInteractor.getStudentGradesForCurrentSemester(page);
      await page.close();
      return grades;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student grades for current semester';
    }
  }
}
