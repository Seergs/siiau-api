import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { ExtraKardexData, Grade, KardexGrade } from '../entities/grade.entity';

export class GradesInteractor {
  private static readonly logger = new Logger(GradesInteractor.name);

  static async getStudentGradesForCurrentCalendar(page: Page) {
    await this.navigateToRequestedPageForCurrentCalendar(page);
    return await this.getGradesForCurrentCalendar(page);
  }

  static async getStudentGradesForCalendar(calendar: string, page: Page) {
    await this.navigateToRequestedPage(page);
    return await this.getGradesForCalendar(calendar, page);
  }

  static async getStudentGradesForAllCalendars(page: Page) {
    await this.navigateToRequestedPage(page);
  }

  static async navigateToRequestedPageForCurrentCalendar(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentCurrentGradesMenu(menuFrame);

      const contentFrame = await PuppeteerService.getFrameFromPage(
        page,
        'Contenido',
      );
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

  static async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToKardexMenu(menuFrame);

      const contentFrame = await PuppeteerService.getFrameFromPage(
        page,
        'Contenido',
      );
      let isStudentGradePageLoaded = false;
      let retryCounter = 0;
      while (!isStudentGradePageLoaded && retryCounter < 5) {
        await page.waitForTimeout(1000);
        const contentFrameContent = await contentFrame.content();
        if (
          contentFrameContent.includes(
            constants.selectors.studentKardex.validator,
          )
        ) {
          this.logger.log(
            `User grades page (kardex) loaded after ${retryCounter} retries`,
          );
          isStudentGradePageLoaded = true;
        } else {
          retryCounter++;
        }
      }
      if (!isStudentGradePageLoaded) {
        this.logger.error(
          'Student grades page (kardex) was not loaded after 5 retries, aborting',
        );
        throw new InternalServerErrorException(
          'Something went wrong, please try again later',
        );
      }
    } catch (e) {
      this.logger.error(e);
    }
  }
  private static async getGradesForCurrentCalendar(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

    const grades: Grade[] = [];

    const NUMBER_OF_COLUMNS = 7;
    const START_COLUMN = 1;
    const START_ROW = 2;
    let thereAreMoreRows = true;

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      const grade = new Grade();
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
          const responseKey = constants.selectors.studentGrades.cells[j];
          if (j === 4 || j == 5) {
            grade.regularGrade[responseKey] = text;
          } else if (j == 6 || j == 7) {
            grade.extraGrade[responseKey] = text;
          } else {
            grade[responseKey] = text;
          }
        } catch (e) {
          thereAreMoreRows = false;
          break;
        }
      }
      if (thereAreMoreRows) {
        grades.push(grade);
      }
    }
    return grades;
  }

  private static async navigateToStudentCurrentGradesMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentGrades,
    );
  }

  private static async navigateToKardexMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentKardex,
    );
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

  private static async getGradesForCalendar(calendar: string, page: Page) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );
    const calendarSelector =
      constants.selectors.studentKardex.calendarHeadingValidator.replace(
        '{1}',
        calendar,
      );

    let grades: KardexGrade[] = [];

    const NUMBER_OF_COLUMNS = 7;
    const START_COLUMN = 1;
    let thereAreMoreRows = true;
    let i = 1;
    let j: number;
    let k: number;
    while (true) {
      const headingSelector = constants.selectors.studentKardex.calendarHeading;
      const currentHeadingSelector = headingSelector.replace(
        '{i}',
        i.toString(),
      );
      try {
        const heading = await PuppeteerService.getElementFromWrapperNoWait(
          contentFrame,
          currentHeadingSelector,
        );
        const headingText = await heading.evaluate((e) => e.textContent);
        if (headingText === calendarSelector) {
          break;
        }
      } catch (e) {
        this.logger.debug(
          'Calendar not found in ' +
            currentHeadingSelector +
            ', trying next one',
        );
      }
      i++;
    }

    for (j = i + 2; thereAreMoreRows; ++j) {
      const grade = new KardexGrade();
      let hasExtraData = false;
      for (k = START_COLUMN; k <= NUMBER_OF_COLUMNS; ++k) {
        const selector = constants.selectors.studentKardex.cell;

        const currentCellSelector = selector
          .replace('{j}', j.toString())
          .replace('{k}', k.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
            contentFrame,
            currentCellSelector,
          );

          const text = await cell.evaluate((c) => c.textContent.trim());
          if (text === '' && k < 2) {
            await this.parseExtraDataForCurrentGrade(grades[grades.length - 1], contentFrame, j);
	    hasExtraData = true
	    break;
          } else {
            const responseKey = constants.selectors.studentKardex.cells[k];
            grade[responseKey] = text;
          }
        } catch (e) {
          thereAreMoreRows = false;
          break;
        }
      }
      if (thereAreMoreRows && !hasExtraData) {
        grades.push(grade);
      }
    }
    return grades;
  }
  static async parseExtraDataForCurrentGrade(
    receivedGrade: KardexGrade,
    frame: Frame,
    row: number,
  ) {
    receivedGrade.extra = new ExtraKardexData();
    try {
      const gradeSelector = constants.selectors.studentKardex.cell
        .replace('{j}', row.toString())
        .replace('{k}', '2');
      const typeSelector = constants.selectors.studentKardex.cell
        .replace('{j}', row.toString())
        .replace('{k}', '3');
      const creditsSelector = constants.selectors.studentKardex.cell
        .replace('{j}', row.toString())
        .replace('{k}', '4');
      const dateSelector = constants.selectors.studentKardex.cell
        .replace('{j}', row.toString())
        .replace('{k}', '5');
      const grade = await PuppeteerService.getElementFromWrapperNoWait(
        frame,
        gradeSelector,
      );
      const type = await PuppeteerService.getElementFromWrapperNoWait(
        frame,
        typeSelector,
      );
      const credits = await PuppeteerService.getElementFromWrapperNoWait(
        frame,
        creditsSelector,
      );
      const date = await PuppeteerService.getElementFromWrapperNoWait(
        frame,
        dateSelector,
      );

      receivedGrade.extra['grade'] = await grade.evaluate((e) => e.textContent);
      receivedGrade.extra['type'] = await type.evaluate((e) => e.textContent);
      receivedGrade.extra['credits'] = await credits.evaluate(
        (e) => e.textContent,
      );
      receivedGrade.extra['date'] = await date.evaluate((e) => e.textContent);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
