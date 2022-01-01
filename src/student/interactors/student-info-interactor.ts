import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import constants from '../../constants';
import { StudentInfo, studentInfoKeys } from '../entities/student-info-entity';

export class StudentInfoInteractor {
  private static readonly logger = new Logger(StudentInfoInteractor.name);

  static async getStudentInfo(page: Page, paramsRequested: string[]) {
    await this.navigateToRequestedPage(page);
    return await this.getInfo(page, paramsRequested);
  }

  private static async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentInfoMenu(menuFrame);

      const contentFrame = await PuppeteerService.getFrameFromPage(
        page,
        'Contenido',
      );
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

  private static async navigateToStudentsMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentsLink,
    );
  }

  private static async navigateToAcademicMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.academicLink,
    );
  }

  private static async navigateToStudentInfoMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentInfo,
    );
  }

  private static async getInfo(page: Page, paramsRequested: string[]) {
    const student = new StudentInfo();
    const totalParams = studentInfoKeys;
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

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

  private static filterUnrequestedParams(
    preResponse: StudentInfo,
    paramsRequested: string[],
  ) {
    const totalParams = studentInfoKeys;
    const unrequestedParams = totalParams.filter(
      (p) => !paramsRequested.includes(p),
    );
    for (const unrequestedParam of unrequestedParams) {
      delete preResponse[unrequestedParam];
    }
  }
}
