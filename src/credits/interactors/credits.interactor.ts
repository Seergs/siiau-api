import { Frame, Page } from 'puppeteer';
import constants from '../../constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { AreaCredits, Credits } from '../entities/credits.entity';

export class CreditsInteractor {
  private static readonly logger = new Logger(CreditsInteractor.name);

  static async getCredits(page: Page) {
    await this.navigateToKardexPage(page);
    return await this.getCreditsFromPage(page);
  }

  static async getCreditsFromPage(page: Page) {
    const contentFrame = await PuppeteerService.getFrameFromPage(
      page,
      'Contenido',
    );
    const credits = new Credits();
    const { required, aquired, left } = await this.getSummaryCreditsFromFrame(
      contentFrame,
    );
    credits.required = required;
    credits.aquired = aquired;
    credits.left = left;

    const {
      mandatorySpecialized,
      selectiveSpecialized,
      elective,
      basicCommon,
      basicParticular,
    } = await this.getDetailedCredits(contentFrame);
    credits.mandatorySpecializedSubject = mandatorySpecialized;
    credits.selectiveSpecializedSubject = selectiveSpecialized;
    credits.electiveSubject = elective;
    credits.commonBasic = basicCommon;
    credits.particularBasic = basicParticular;
    return credits;
  }

  static async getSummaryCreditsFromFrame(frame: Frame) {
    const requiredSelector = constants.selectors.credits.summary.required;
    const requiredCredits = await PuppeteerService.getElementFromWrapper(
      frame,
      requiredSelector,
    );
    const aquiredSelector = constants.selectors.credits.summary.aquired;
    const aquiredCredits = await PuppeteerService.getElementFromWrapper(
      frame,
      aquiredSelector,
    );
    const leftSelector = constants.selectors.credits.summary.left;
    const leftCredits = await PuppeteerService.getElementFromWrapper(
      frame,
      leftSelector,
    );

    return {
      required: await requiredCredits.evaluate((e) => e.textContent),
      aquired: await aquiredCredits.evaluate((e) => e.textContent),
      left: await leftCredits.evaluate((e) => e.textContent),
    };
  }

  static async getDetailedCredits(frame: Frame) {
    let credits: {
      mandatorySpecialized?: AreaCredits;
      selectiveSpecialized?: AreaCredits;
      elective?: AreaCredits;
      basicCommon?: AreaCredits;
      basicParticular?: AreaCredits;
    } = {};

    const NUMBER_OF_COLUMNS = 3;
    const START_COLUMN = 1;
    const START_ROW = 5;
    const END_ROW = 10;

    let i: number;
    let j: number;
    for (i = START_ROW; i < END_ROW; ++i) {
      let values = [];
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.credits.detailed.cell;
        const currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
            frame,
            currentCellSelector,
          );

          const text = await cell.evaluate((c) => c.textContent.trim());
          values.push(text);
        } catch (e) {}
      }
      const row = this.parseRow(values);
      if (i === 5) {
        credits.mandatorySpecialized = row;
      }
      if (i === 6) {
        credits.selectiveSpecialized = row;
      }
      if (i === 7) {
        credits.elective = row;
      }
      if (i === 8) {
        credits.basicCommon = row;
      }
      if (i === 9) {
        credits.basicParticular = row;
      }
    }
    return credits;
  }

  static parseRow(values: string[]) {
    return new AreaCredits({
      required: values[0],
      aquired: values[1],
      left: values[2],
    });
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
}
