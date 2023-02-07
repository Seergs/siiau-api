import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { Payment, PaymentResponse } from '../entities/payment.entity';
import * as Sentry from '@sentry/node';

export class PaymentInteractor {
  private static readonly logger = new Logger(PaymentInteractor.name);

  static async getPaymentOrder(page: Page) {
    await this.navigateToRequestedPage(page);
    return this.getPaymentOrderFromPage(page);
  }

  static async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToPaymentOrderMenu(menuFrame);

      await this.waitUntilRequestedPageIsLoaded(
        page,
        constants.selectors.payment.validator,
      );
    } catch (e) {
      this.logger.error(e);
      Sentry.captureException(e);
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
    let isStudentPaymentOrderPageLoaded = false;
    let retryCounter = 0;
    while (!isStudentPaymentOrderPageLoaded && retryCounter < 5) {
      await page.waitForTimeout(1000);
      const contentFrameContent = await contentFrame.content();
      if (contentFrameContent.includes(validator)) {
        this.logger.log(
          `User payment order page loaded after ${retryCounter} retries`,
        );
        isStudentPaymentOrderPageLoaded = true;
      } else {
        retryCounter++;
      }
    }
    if (!isStudentPaymentOrderPageLoaded) {
      this.logger.error(
        'Student payment order page was not loaded after 5 retries, aborting',
      );
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  private static async navigateToPaymentOrderMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.paymentOrderLink,
    );
  }

  private static async navigateToStudentsMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.studentsLink,
    );
  }

  private static async getPaymentOrderFromPage(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

    const payments: Payment[] = [];

    const NUMBER_OF_COLUMNS = 6;
    const START_COLUMN = 1;
    const START_ROW = 2;
    const EMPTY_FOOTER_CELL_COLUMN = 1;
    let thereAreMoreRows = true;

    let total: string;

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      const payment = new Payment();
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.payment.cell;
        let currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          let cell = await PuppeteerService.getElementFromWrapperNoWait(
            frame,
            currentCellSelector,
          );

          const text = await cell.evaluate((c) => c.textContent.trim());

          if (j == EMPTY_FOOTER_CELL_COLUMN && text.trim() === '') {
            // Means we are in the footer so just get the total and exit

            currentCellSelector = selector
              .replace('{i}', i.toString())
              .replace('{j}', '2');
            cell = await PuppeteerService.getElementFromWrapperNoWait(
              frame,
              currentCellSelector,
            );

            total = await cell.evaluate((c) => c.textContent.trim());
            thereAreMoreRows = false;
            break;
          }

          const responseKey = constants.selectors.payment.cells[j];
          payment[responseKey] = text;
        } catch (e) {
          thereAreMoreRows = false;
          break;
        }
      }
      if (thereAreMoreRows) {
        payments.push(payment);
      }
    }
    return new PaymentResponse({ payments, total });
  }
}
