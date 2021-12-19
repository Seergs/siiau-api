import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Browser, Frame, Page } from 'puppeteer';
import { InjectBrowser } from 'nest-puppeteer';
import constants from '../constants';
import {Student} from './entities/student-entity';

@Injectable()
export class StudentService {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async setUpInitialPage() {
    const page = await this.browser.newPage();
    await page.goto(constants.urls.homePage);
    return page;
  }

  async login(page: Page, studentCode: string, studentNip: string) {
    try {
      const loginFrame = this.getFrameFromPage(page, 'mainFrame');
      await loginFrame.type(constants.selectors.login.code, studentCode);
      await loginFrame.type(constants.selectors.login.nip, studentNip);
      await loginFrame.click(constants.selectors.login.button);
      await page.waitForTimeout(1000);
      const homePageFrame = this.getFrameFromPage(page, 'Contenido');
      return (await homePageFrame.content()).includes(
        constants.selectors.home.validator,
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getStudent(studentCode: string, studentNip: string) {
    try {
      const page = await this.setUpInitialPage();
      const isLoggedIn = await this.login(page, studentCode, studentNip);
      if (!isLoggedIn) return 'Invalid credentials';
      await this.navigateToRequestedPage(page);
      const studentInfo = await this.getStudentInfo(page);
      await page.close();
      return studentInfo;
    } catch (e) {
      console.log(e);
      return 'Something went wrong getting the student information';
    }
  }

  async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = this.getFrameFromPage(page, 'Menu');
      const studentsButton = await this.getElementFromWrapper(
        menuFrame,
        constants.selectors.home.studentsLink,
      );
      await studentsButton.click();
      await page.waitForTimeout(1000);
      const academicButton = await this.getElementFromWrapper(
        menuFrame,
        constants.selectors.home.academicLink,
      );
      await academicButton.click();
      await page.waitForTimeout(1000);
      const studentInfoButton = await this.getElementFromWrapper(
        menuFrame,
        constants.selectors.home.studentInfo,
      );
      await studentInfoButton.click();
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log(e);
    }
  }

  async getStudentInfo(page: Page) {
    const studentInfo: Student = {
      code: '',
      name: '',
      campus: '',
      career: '',
      degree: '',
      status: '',
      location: '',
      lastSemester: '',
      admissionDate: '',
    };
    const frame = this.getFrameFromPage(page, 'Contenido');
    const code = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.code,
    );
    studentInfo.code = await code.evaluate((e) => e.textContent);
    const name = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.name,
    );
    studentInfo.name = await name.evaluate((e) => e.textContent);
    const campus = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.campus,
    );
    studentInfo.campus = await campus.evaluate((e) => e.textContent);
    const career = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.career,
    );
    studentInfo.career = await career.evaluate((e) => e.textContent);
    const degree = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.degree,
    );
    studentInfo.degree = await degree.evaluate((e) => e.textContent);
    const status = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.status,
    );
    studentInfo.status = await status.evaluate((e) => e.textContent);
    const location = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.location,
    );
    studentInfo.location = await location.evaluate((e) => e.textContent);
    const lastSemester = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.lastSemester,
    );
    studentInfo.lastSemester = await lastSemester.evaluate(
      (e) => e.textContent,
    );
    const admissionDate = await this.getElementFromWrapper(
      frame,
      constants.selectors.studentInfo.admissionDate,
    );
    studentInfo.admissionDate = await admissionDate.evaluate(
      (e) => e.textContent,
    );
    return studentInfo;
  }

  getFrameFromPage(page: Page, frameName: string) {
    const frame = page.frames().find((frame) => frame.name() === frameName);
    if (!frame)
      throw new InternalServerErrorException('No frame found ' + frameName);
    return frame;
  }

  async getElementFromWrapper(wrapper: Page | Frame, selector: string) {
    const [element] = await wrapper.$x(selector);
    if (!element)
      throw new InternalServerErrorException(`Element ${selector} not found`);
    return element;
  }
}
