import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from '../../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { Schedule, SubjectSchedule } from '../entities/schedule.entity';
import * as Sentry from '@sentry/node';
import { AlertService } from 'src/alerts/alerts.service';

export class ScheduleInteractor {
  private readonly logger = new Logger(ScheduleInteractor.name);

  constructor(private readonly alerts: AlertService) {}

  async getScheduleForCurrentCalendar(page: Page) {
    await this.navigateToRequestedPage(page);
    return await this.getStudentScheduleForCurrentCalendar(page);
  }

  async getScheduleForCalendar(calendar: string, page: Page) {
    await this.navigateToRequestedPage(page);
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');
    await this.switchCalendar(calendar, frame);
    await page.waitForTimeout(1000);
    return await this.getStudentScheduleFromPage(page);
  }

  async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToRegisterMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToScheduleMenu(menuFrame);

      await this.waitUntilRequestedPageIsLoaded(
        page,
        constants.selectors.studentSchedule.validator,
      );
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

  private async navigateToRegisterMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.registerLink,
    );
  }

  private async navigateToScheduleMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.scheduleLink,
    );
  }

  private async waitUntilRequestedPageIsLoaded(page: Page, validator: string) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );
    let isStudentSchedulePageLoaded = false;
    let retryCounter = 0;
    while (!isStudentSchedulePageLoaded && retryCounter < 5) {
      await page.waitForTimeout(1000);
      const contentFrameContent = await contentFrame.content();
      if (contentFrameContent.includes(validator)) {
        this.logger.log(
          `User schedule page loaded after ${retryCounter} retries`,
        );
        isStudentSchedulePageLoaded = true;
      } else {
        retryCounter++;
      }
    }
    if (!isStudentSchedulePageLoaded) {
      this.logger.error(
        'Student schedule page was not loaded after 5 retries, aborting',
      );
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  // calendarValue should be something like 202120 (2021B) to match the <option> value
  private async switchCalendar(calendarValue: string, frame: Frame) {
    try {
      await frame.select(
        constants.selectors.studentSchedule.select,
        calendarValue,
      );
    } catch (e) {
      throw new BadRequestException('No calendar found ' + calendarValue);
    }
  }

  private async getValueOfLastCalendar(frame: Frame) {
    const lastCalendarElement = await PuppeteerService.getElementFromWrapper(
      frame,
      constants.selectors.studentSchedule.lastCalendar,
    );
    return await lastCalendarElement.evaluate((e) => e.getAttribute('value'));
  }

  private async getStudentScheduleForCurrentCalendar(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');
    const calendarValue = await this.getValueOfLastCalendar(frame);
    await this.switchCalendar(calendarValue, frame);
    await page.waitForTimeout(1000);
    return await this.getStudentScheduleFromPage(page);
  }

  private async getStudentScheduleFromPage(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

    const schedule: SubjectSchedule[] = [];

    const NUMBER_OF_COLUMNS = 17;
    const START_COLUMN = 1;
    const START_ROW = 3;
    const LAST_REGULAR_COLUMN = 5;
    const DAYS_COLUMN_START = 7;
    const DAYS_COLUMN_END = 12;
    const SINGLE_SCHEDULE_START_COLUMN = 13;
    let thereAreMoreRows = true;

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      const subjectSchedule: SubjectSchedule = new SubjectSchedule();
      const currentSchedule = new Schedule();
      const days = [];
      const daysKeys = [];
      let hasExtraData = false;
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.studentSchedule.cell;
        const currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
            frame,
            currentCellSelector,
          );

          const text = await cell.evaluate((c) => c.textContent.trim());

          if (text === '' && j < 2) {
            await this.parseExtraDataForCurrentSubjectSchedule(
              schedule[schedule.length - 1],
              frame,
              i,
            );
            hasExtraData = true;
            break;
          } else if (j <= LAST_REGULAR_COLUMN) {
            const responseKey = constants.selectors.studentSchedule.cells[j];
            subjectSchedule[responseKey] = text;
          } else if (j >= DAYS_COLUMN_START && j <= DAYS_COLUMN_END) {
            if (text !== '') {
              days.push(this.parseDayToReadableFormat(text));
              daysKeys.push(text);
            }
          } else if (j >= SINGLE_SCHEDULE_START_COLUMN || j === 6) {
            const responseKey = constants.selectors.studentSchedule.cells[j];
            currentSchedule[responseKey] = text;
          } else {
            this.logger.error('Unknown column index ' + j);
          }
        } catch (e) {
          thereAreMoreRows = false;
          break;
        }
      }
      currentSchedule.daysKeys = daysKeys;
      currentSchedule.days = this.parseArrayToReadableFormat(days);
      if (thereAreMoreRows && !hasExtraData) {
        subjectSchedule.schedules.push(currentSchedule);
        schedule.push(subjectSchedule);
      }
    }
    return schedule;
  }

  private async parseExtraDataForCurrentSubjectSchedule(
    receivedSubjectSchedule: SubjectSchedule,
    frame: Frame,
    row: number,
  ) {
    const schedule = new Schedule();
    const days = [];
    const daysKeys = [];
    try {
      let j = 2;
      while (j < 14) {
        const currentCellSelector = constants.selectors.studentSchedule.cell
          .replace('{i}', row.toString())
          .replace('{j}', j.toString());
        const element = await PuppeteerService.getElementFromWrapperNoWait(
          frame,
          currentCellSelector,
        );
        const text = await element.evaluate((e) => e.textContent);
        if (j > 2 && j < 9) {
          if (text !== '') {
            days.push(this.parseDayToReadableFormat(text));
            daysKeys.push(text);
          }
        } else {
          const responseKey = constants.selectors.studentSchedule.cellsExtra[j];
          schedule[responseKey] = text;
        }

        j++;
      }
      schedule.daysKeys = daysKeys;
      schedule.days = this.parseArrayToReadableFormat(days);
      receivedSubjectSchedule.schedules.push(schedule);
    } catch (e) {
      this.logger.error(e);
      Sentry.captureException(e);
    }
  }

  private parseDayToReadableFormat(dayUnparsed: string) {
    const dayFormats = {
      L: 'Monday',
      M: 'Tuesday',
      I: 'Wednesday',
      J: 'Thursday',
      V: 'Friday',
      S: 'Saturday',
    };

    return dayFormats[dayUnparsed];
  }

  private parseArrayToReadableFormat(arr: string[]) {
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' and ' + arr.slice(-1);
  }
}
