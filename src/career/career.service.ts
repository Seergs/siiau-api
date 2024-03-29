import { Injectable, Logger } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';

@Injectable()
export class CareerService {
  private static readonly logger = new Logger(CareerService.name);

  static async hasMoreCareers(page: Page, workingFrame: Frame) {
    this.logger.log('Validating if the student has more than one career..');
    let tries = 0;
    while (tries < 3) {
      await page.waitForTimeout(1000);
      const contetStr = await workingFrame.content();
      if (
        contetStr.includes(constants.selectors.home.hasMoreCareersValidator)
      ) {
        this.logger.log('The student has more than one career');
        return true;
      } else {
        tries++;
      }
    }

    this.logger.log('The student has only one career');
    return false;
  }

  static async processCareersSelection(
    contentFrame: Frame,
    selectedCareer: string,
  ) {
    this.logger.log('The student has more than one career');
    if (!selectedCareer) {
      this.logger.log(
        'No career name provided, choosing the first career on the list..',
      );
      await contentFrame.click('input[type=submit]');
    } else {
      const indexSelected = await this.selectOneCareer(
        contentFrame,
        selectedCareer,
      );
      if (indexSelected == -1) {
        this.logger.warn(
          { career: selectedCareer },
          'Career not found. Choosing the first career on the list',
        );
        await contentFrame.click('input[type=submit]');
      } else {
        const searchBtn = await contentFrame.$x(
          constants.selectors.home.btnCareerValidator.replace(
            '{i}',
            indexSelected.toString(),
          ),
        );
        await searchBtn[0].click();
        this.logger.log({ career: selectedCareer }, 'Career found');
      }
    }
  }

  static async selectOneCareer(workingFrame: Frame, career: string) {
    career = career.toUpperCase();
    let moreRows = true;
    const selector = constants.selectors.home.selectCareerCell;

    for (let i = 3; moreRows; i++) {
      const selectorCell = selector.replace('{i}', i.toString());

      try {
        const cell = await PuppeteerService.getElementFromWrapperNoWait(
          workingFrame,
          selectorCell,
        );
        const text = await cell.evaluate((c) => c.textContent.trim());

        if (text.includes(career)) {
          return i;
        }
      } catch (e) {
        moreRows = false;
      }
    }
    return -1;
  }
}
