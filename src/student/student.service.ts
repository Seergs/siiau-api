import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../constants';
import { Student, studentKeys } from './entities/student-entity';
import { PageService } from 'src/page/page.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly pageService: PageService,
    private readonly authService: AuthService,
  ) {}

  async getStudent(
    studentCode: string,
    studentNip: string,
    paramsRequested: string[],
  ) {
    try {
      const page = await this.pageService.setUpInitialPage(
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
      const menuFrame = PageService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentInfoMenu(menuFrame);

      const contentFrame = PageService.getFrameFromPage(page, 'Contenido');
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
      await PageService.clickElementOfWrapper(
        workingFrame,
        constants.selectors.home.studentsLink,
      );
  }

  async navigateToAcademicMenu(workingFrame: Frame) {
      await PageService.clickElementOfWrapper(
        workingFrame,
        constants.selectors.home.academicLink,
      );
  }

  async navigateToStudentInfoMenu(workingFrame: Frame) {
      await PageService.clickElementOfWrapper(
        workingFrame,
        constants.selectors.home.studentInfo,
      );

  }

  async getStudentInfo(page: Page, paramsRequested: string[]) {
    const student = new Student();
    const totalParams = studentKeys;
    const frame = PageService.getFrameFromPage(page, 'Contenido');

    for (const param of totalParams) {
      const element = await PageService.getElementFromWrapper(
        frame,
        constants.selectors.studentInfo[param],
      );
      student[param] = await element.evaluate((e) => e.textContent);
    }

    this.filterUnrequestedParams(student, paramsRequested);
    return student;
  }

  filterUnrequestedParams(preResponse: Student, paramsRequested: string[]) {
    const totalParams = studentKeys;
    const unrequestedParams = totalParams.filter(
      (p) => !paramsRequested.includes(p),
    );
    for (const unrequestedParam of unrequestedParams) {
      delete preResponse[unrequestedParam];
    }
  }
}
