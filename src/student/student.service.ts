import {
  Injectable,
  Logger,
} from '@nestjs/common';
import constants from '../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';
import {Page} from 'puppeteer';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly puppeteerService: PuppeteerService,
  ) {}

  async getStudent(page: Page, paramsRequested: string[]) {
    try {
      const studentInfo = await StudentInfoInteractor.getStudentInfo(
        page,
        paramsRequested,
      );
      await page.close();
      this.logger.log("Done getting student information");
      return studentInfo;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }


  async getAcademicProgress(page: Page) {
    try {
      const studentProgress =
        await StudentProgressInteractor.getAcademicProgress(page);
      await page.close();
      return studentProgress;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student progress';
    }
  }

}
