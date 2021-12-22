import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../constants';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { AuthService } from 'src/auth/auth.service';
import {
  StudentProgress,
  StudentProgressResponse,
  StudentProgressTotal,
} from './entities/student-progress-entity';

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
      await this.navigateToRequestedPage(page);
      const studentInfo = await this.getStudentInfo(page, paramsRequested);
      await page.close();
      return studentInfo;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }

  async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentInfoMenu(menuFrame);

      const contentFrame = PuppeteerService.getFrameFromPage(page, 'Contenido');
      let isStudentInfoPageLoaded = false;
      let retryCounter = 0;
      while (!isStudentInfoPageLoaded && retryCounter < 5) {
        await page.waitForTimeout(1000);
        const contentFrameContent = await contentFrame.content();
        if (
          contentFrameContent.includes(
            constants.selectors.studentInfo.validator,
          )
        ) {
          this.logger.log(
            `User information page loaded after ${retryCounter} retries`,
          );
          isStudentInfoPageLoaded = true;
        } else {
          retryCounter++;
        }
      }
      if (!isStudentInfoPageLoaded) {
        this.logger.error(
          'Student info page was not loaded after 5 retries, aborting',
        );
        throw new InternalServerErrorException(
          'Something went wrong, please try again later',
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  async navigateToStudentsMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentsLink,
    );
  }

  async navigateToAcademicMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.academicLink,
    );
  }

  async navigateToStudentInfoMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentInfo,
    );
  }

  async getStudentInfo(page: Page, paramsRequested: string[]) {
    const student = new StudentInfo();
    const totalParams = studentInfoKeys;
    const frame = PuppeteerService.getFrameFromPage(page, 'Contenido');

    for (const param of totalParams) {
      const element = await PuppeteerService.getElementFromWrapper(
        frame,
        constants.selectors.studentInfo[param],
      );
      student[param] = await element.evaluate((e) => e.textContent);
    }

    this.filterUnrequestedParams(student, paramsRequested);
    return student;
  }

  filterUnrequestedParams(preResponse: StudentInfo, paramsRequested: string[]) {
    const totalParams = studentInfoKeys;
    const unrequestedParams = totalParams.filter(
      (p) => !paramsRequested.includes(p),
    );
    for (const unrequestedParam of unrequestedParams) {
      delete preResponse[unrequestedParam];
    }
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
      await this.navigateToRequestedPage(page);
      const studentProgress = await this.getStudentProgress(page);
      await page.close();
      return studentProgress;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }

  async getStudentProgress(page: Page): Promise<StudentProgressResponse> {
    const frame = PuppeteerService.getFrameFromPage(page, 'Contenido');
    const NUMBER_OF_COLUMNS = 8;
    const START_COLUMN = 1;
    const START_ROW = 3;
    let thereAreMoreRows = true;

    let semesters: StudentProgress[] = [];

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      const rowData = new StudentProgress();
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.studentProgress.cell;
        const currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapper(
            frame,
            currentCellSelector,
          );
          const text = await cell.evaluate((c) => c.textContent.trim());
          const responseKey =
            constants.selectors.studentProgress.regularCells[j];
          rowData[responseKey] = text;
        } catch (e) {
          thereAreMoreRows = false;
          i--;
          break;
        }
      }
      if (thereAreMoreRows) {
        semesters.push(rowData);
      }
    }
    const total = await this.getAcademicProgressTotal(frame, i);
    return new StudentProgressResponse({ semesters, total });
  }

  async getAcademicProgressTotal(frame: Frame, i: number) {
    const total = new StudentProgressTotal();
    const NUMBER_OF_COLUMNS = 8;
    const START_COLUMN = 6;

    for (let j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
      const selector = constants.selectors.studentProgress.totalCell;
      const currentCellSelector = selector
        .replace('{i}', i.toString())
        .replace('{j}', j.toString());
      const cell = await PuppeteerService.getElementFromWrapper(
        frame,
        currentCellSelector,
      );
      const text = await cell.evaluate((c) => c.textContent.trim());
      const responseKey = constants.selectors.studentProgress.totalCells[j];
      total[responseKey] = text;
    }
    return total;
  }
}
