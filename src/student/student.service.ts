import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { AuthService } from 'src/auth/auth.service';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly authService: AuthService,
  ) {}

  async getStudent(
    studentCode: string,
    studentNip: string,
    paramsRequested: string[],
  ) {
    try {
      const page = await this.puppeteerService.setUpInitialPage(
        constants.urls.homePage,
      );
      const isLoggedIn = await this.authService.login(
        page,
        studentCode,
        studentNip,
      );
      if (!isLoggedIn) return 'Invalid credentials';
      const studentInfo = await StudentInfoInteractor.getStudentInfo(
        page,
        paramsRequested,
      );
      await page.close();
      return studentInfo;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }

  async navigateToStudentGradesMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentGrades,
    );
  }

  async getAcademicProgress(studentCode: string, studentNip: string) {
    try {
      const page = await this.puppeteerService.setUpInitialPage(
        constants.urls.homePage,
      );
      const isLoggedIn = await this.authService.login(
        page,
        studentCode,
        studentNip,
      );
      if (!isLoggedIn) return 'Invalid credentials';
      const studentProgress =
        await StudentProgressInteractor.getAcademicProgress(page);
      await page.close();
      return studentProgress;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student progress';
    }
  }

  async getSemesterGrades(studentCode: string, studentNip: string) {
    try {
      const page = await this.puppeteerService.setUpInitialPage(
        constants.urls.homePage,
      );
      const isLoggedIn = await this.authService.login(
        page,
        studentCode,
        studentNip,
      );
      if (!isLoggedIn) return 'Invalid credentials';
      await this.navigateToRequestedPageV2(page);
      await this.getStudentGrades(page);
      await page.close();
      return true;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }
  async navigateToRequestedPageV2(page: Page) {
    try {
      const menuFrame = PuppeteerService.getFrameFromPage(page, 'Menu');
      // await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      // await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentGradesMenu(menuFrame);

      const contentFrame = PuppeteerService.getFrameFromPage(page, 'Contenido');
      let isStudentGradePageLoaded = false;
      let retryCounter = 0;
      while (!isStudentGradePageLoaded && retryCounter < 5) {
        await page.waitForTimeout(1000);
        const contentFrameContent = await contentFrame.content();
        if (
          contentFrameContent.includes(
            constants.selectors.studentGrades.validator,
          )
        ) {
          this.logger.log(
            `User grades page loaded after ${retryCounter} retries`,
          );
          isStudentGradePageLoaded = true;
        } else {
          retryCounter++;
        }
      }
      if (!isStudentGradePageLoaded) {
        this.logger.error(
          'Student grades page was not loaded after 5 retries, aborting',
        );
        throw new InternalServerErrorException(
          'Something went wrong, please try again later',
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
  async getStudentGrades(page: Page) {
    const frame = PuppeteerService.getFrameFromPage(page, 'Contenido');
    const NUMBER_OF_COLUMNS = 7;
    const START_COLUMN = 1;
    const START_ROW = 2;
    let thereAreMoreRows = true;

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.studentGrades.cell;
        const currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
            frame,
            currentCellSelector,
          );
          const text = await cell.evaluate((c) => c.textContent.trim());
          console.log(text);
          // const responseKey =
          //   constants.selectors.studentProgress.regularCells[j];
          // rowData[responseKey] = text;
        } catch (e) {
          thereAreMoreRows = false;
          i--;
          break;
        }
      }
      // if (thereAreMoreRows) {
      //   semesters.push(rowData);
      // }
    }
    // const total = await this.getAcademicProgressTotal(frame, i);
    // return new StudentProgressResponse({ semesters, total });
  }
}
