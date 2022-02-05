import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { ExtraKardexData, Grade, KardexGrade } from '../entities/grade.entity';
import { CalendarGrades } from '../entities/calendar-grades.entity';
import { CareerService } from 'src/career/career.service';

export class GradesInteractor {
  private static readonly logger = new Logger(GradesInteractor.name);

  static async getStudentGradesForCurrentCalendar(
    page: Page,
    selectedCareer: string,
  ) {
    await this.navigateToRequestedPage(page, false, selectedCareer);
    return await this.getGradesForCurrentCalendar(page);
  }

  static async getStudentGradesForCalendars(calendars: string[], page: Page) {
    await this.navigateToRequestedPage(page, true, null);
    let grades: CalendarGrades[] = [];
    for (const calendar of calendars) {
      const gradesForCalendar = await this.getGradesForCalendar(calendar, page);
      grades.push(gradesForCalendar);
    }
    return grades;
  }

  static async getStudentGradesForAllCalendars(page: Page) {
    await this.navigateToRequestedPage(page, true, null);
    return await this.getGradesForAllCalendars(page);
  }

  static async navigateToRequestedPage(
    page: Page,
    areGradesFromKardex: boolean,
    selectedCareer: string,
  ) {
    if (areGradesFromKardex) {
      await this.navigateToKardexPage(page);
    } else {
      await this.navigateToReportCardPage(page, selectedCareer);
    }
  }

  static async navigateToReportCardPage(page: Page, selectedCareer: string) {
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

      if (await CareerService.hasMoreCareers(page, contentFrame))
        await CareerService.processCareersSelection(
          contentFrame,
          selectedCareer,
        );

      await this.waitUntilRequestedPageIsLoaded(
        page,
        constants.selectors.studentGrades.validator,
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  static async navigateToKardexPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToKardexMenu(menuFrame);

      await this.waitUntilRequestedPageIsLoaded(
        page,
        constants.selectors.studentKardex.validator,
      );
    } catch (e) {
      this.logger.error(e);
    }
  }

  private static async waitUntilRequestedPageIsLoaded(
    page: Page,
    validator: string,
  ) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );

    let isStudentGradePageLoaded = false;
    let retryCounter = 0;
    while (!isStudentGradePageLoaded && retryCounter < 5) {
      await page.waitForTimeout(1000);
      const contentFrameContent = await contentFrame.content();
      if (contentFrameContent.includes(validator)) {
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

  private static async getGradesForAllCalendars(page: Page) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );
    let results: CalendarGrades[] = [];
    const calendars = await this.getAvailableCalendars(contentFrame);
    for (const calendar of calendars) {
      const result = await this.getGradesForCalendar(calendar, page);
      results.push(result);
    }
    return results;
  }

  private static async getGradesForCalendar(calendar: string, page: Page) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );

    let grades: KardexGrade[] = [];

    const NUMBER_OF_COLUMNS = 7;
    const START_COLUMN = 1;
    let thereAreMoreRows = true;
    let j: number;
    let k: number;

    let i = await this.findRowOfCalendar(calendar, contentFrame);

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
            await this.parseExtraDataForCurrentGrade(
              grades[grades.length - 1],
              contentFrame,
              j,
            );
            hasExtraData = true;
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
    return new CalendarGrades({ calendar, grades });
  }

  static async findRowOfCalendar(calendar: string, frame: Frame) {
    let i = 1;
    const calendarSelector =
      constants.selectors.studentKardex.calendarHeadingValidator.replace(
        '{1}',
        calendar,
      );

    const table = await PuppeteerService.getElementFromWrapperNoWait(
      frame,
      constants.selectors.studentKardex.table,
    );
    const tableContent = await table.evaluate((e) => e.textContent);
    if (!tableContent.includes(calendarSelector))
      throw new BadRequestException('Calendar ' + calendar + ' not found');

    // Since we already validated the calendar exists, not longer need another weird condition here, it'll break when it finds the correct row
    while (true) {
      const headingSelector = constants.selectors.studentKardex.calendarHeading;
      const currentHeadingSelector = headingSelector.replace(
        '{i}',
        i.toString(),
      );
      try {
        const heading = await PuppeteerService.getElementFromWrapperNoWait(
          frame,
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
    return i;
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

  static async getAvailableCalendars(frame: Frame) {
    let calendars = [];
    const CALENDAR_KEY_START_INDEX = 11;
    const CALENDAR_LENGTH = 15;
    const selector = constants.selectors.studentKardex.calendarAll;
    const frameContent = await frame.content();
    const indexes = this.getIndexes(frameContent, selector);
    for (const index of indexes) {
      // index of the string 'Calendario 17 B', so we need to get a few characters
      // after to get the actual key '17 B'
      const calendar = frameContent.substring(
        index + CALENDAR_KEY_START_INDEX,
        index + CALENDAR_LENGTH,
      );
      calendars.push(calendar);
    }
    return calendars;
  }

  private static getIndexes(text: string, search: string) {
    let indexes = [];
    let i = -1;
    while ((i = text.indexOf(search, i + 1)) !== -1) {
      indexes.push(i);
    }
    return indexes;
  }
}
