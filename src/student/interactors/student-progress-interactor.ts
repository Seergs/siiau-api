import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import { CareerService } from 'src/career/career.service';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import {
  StudentProgress,
  StudentProgressResponse,
  StudentProgressTotal,
} from '../entities/student-progress-entity';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class StudentProgressInteractor {
  private readonly logger = new Logger(StudentProgressInteractor.name);

  constructor(private readonly alerts: AlertService) {}

  async getAcademicProgress(page: Page, selectedCareer: string) {
    await this.navigateToRequestedPage(page, selectedCareer);
    return await this.getAcademicProgressFromPage(page);
  }

  private async getAcademicProgressFromPage(
    page: Page,
  ): Promise<StudentProgressResponse> {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');
    const NUMBER_OF_COLUMNS = 8;
    const START_COLUMN = 1;
    const START_ROW = 3;
    let thereAreMoreRows = true;

    const calendars: StudentProgress[] = [];

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
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
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
        calendars.push(rowData);
      }
    }
    const total = await this.getAcademicProgressTotal(frame, i);
    return new StudentProgressResponse({ semesters: calendars, total });
  }

  private async getAcademicProgressTotal(frame: Frame, i: number) {
    const total = new StudentProgressTotal();
    const NUMBER_OF_COLUMNS = 8;
    const START_COLUMN = 6;

    for (let j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
      const selector = constants.selectors.studentProgress.totalCell;
      const currentCellSelector = selector
        .replace('{i}', i.toString())
        .replace('{j}', j.toString());
      const cell = await PuppeteerService.getElementFromWrapperNoWait(
        frame,
        currentCellSelector,
      );
      const text = await cell.evaluate((c) => c.textContent.trim());
      const responseKey = constants.selectors.studentProgress.totalCells[j];
      total[responseKey] = text;
    }
    return total;
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
}
