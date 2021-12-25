import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { Grade } from '../entities/grade.entity';

export class GradesInteractor {
  private static readonly logger = new Logger(GradesInteractor.name);

  static async getStudentGradesForCurrentSemester(page: Page) {
    await this.navigateToRequestedPageForCurrentSemester(page);
    return await this.getGradesForCurrentSemester(page);
  }

  static async navigateToRequestedPageForCurrentSemester(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToStudentCurrentGradesMenu(menuFrame);

      const contentFrame = await PuppeteerService.getFrameFromPage(page, 'Contenido');
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

  private static async getGradesForCurrentSemester(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

    const grades: Grade[] = []

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
          const responseKey =
            constants.selectors.studentGrades.cells[j];
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
}
