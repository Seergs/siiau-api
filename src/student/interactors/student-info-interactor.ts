import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import constants from '../../constants';
import { StudentInfo, studentInfoKeys } from '../entities/student-info-entity';
import { CareerService } from 'src/career/career.service';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class StudentInfoInteractor {
  private readonly logger = new Logger(StudentInfoInteractor.name);

  constructor(private readonly alerts: AlertService) {}

  async getStudentInfo(
    page: Page,
    paramsRequested: string[],
    selectedCareer: string,
  ) {
    await this.navigateToRequestedPage(page, selectedCareer);
    return await this.getInfo(page, paramsRequested);
  }

  private async navigateToRequestedPage(page: Page, selectedCareer: string) {
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

      if (await CareerService.hasMoreCareers(page, contentFrame))
        await CareerService.processCareersSelection(
          contentFrame,
          selectedCareer,
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
      await this.alerts.sendErrorAlert(page, e);
    }
  }

  private async navigateToStudentsMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentsLink,
    );
  }

  private async navigateToAcademicMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.academicLink,
    );
  }

  private async navigateToStudentInfoMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentInfo,
    );
  }

  private async getInfo(page: Page, paramsRequested: string[]) {
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

  private filterUnrequestedParams(
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
