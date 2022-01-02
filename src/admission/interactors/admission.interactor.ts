import { InternalServerErrorException, Logger } from "@nestjs/common";
import { Frame, Page } from "puppeteer";
import constants from "../../constants";
import { PuppeteerService } from "../../puppeteer/puppeteer.service";
import { Admission } from "../entities/admission.entity";

export class AdmissionInteractor {
  private static readonly logger = new Logger(AdmissionInteractor.name)
  static async getAdmissionInformation(page: Page) {
    await this.navigateToRequestedPage(page);
    return await this.getAdmissionInformationFromPage(page);
  }
  static async navigateToRequestedPage(page: Page) {
    try {
      const menuFrame = await PuppeteerService.getFrameFromPage(page, 'Menu');
      await this.navigateToStudentsMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAcademicMenu(menuFrame);
      await page.waitForTimeout(1000);
      await this.navigateToAdmissionMenu(menuFrame);

      await this.waitUntilRequestedPageIsLoaded(
        page,
        constants.selectors.admission.validator,
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
    let isStudentAdmissionPageLoaded = false;
    let retryCounter = 0;
    while (!isStudentAdmissionPageLoaded && retryCounter < 5) {
      await page.waitForTimeout(1000);
      const contentFrameContent = await contentFrame.content();
      if (contentFrameContent.includes(validator)) {
        this.logger.log(
          `User admission page loaded after ${retryCounter} retries`,
        );
        isStudentAdmissionPageLoaded = true;
      } else {
        retryCounter++;
      }
    }
    if (!isStudentAdmissionPageLoaded) {
      this.logger.error(
        'Student admission page was not loaded after 5 retries, aborting',
      );
      throw new InternalServerErrorException(
        'Something went wrong, please try again later',
      );
    }
  }

  private static async navigateToAdmissionMenu(workingFrame: Frame) {
    await PuppeteerService.clickElementOfWrapper(
      workingFrame,
      constants.selectors.home.admissionLink,
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
  static async getAdmissionInformationFromPage(page: Page) {
    const frame = await PuppeteerService.getFrameFromPage(page, 'Contenido');

    const admissions: Admission[] = []

    const NUMBER_OF_COLUMNS = 8;
    const START_COLUMN = 1;
    const START_ROW = 2;
    let thereAreMoreRows = true;

    let i: number;
    let j: number;
    for (i = START_ROW; thereAreMoreRows; ++i) {
      const admissionInfo = new Admission();
      for (j = START_COLUMN; j <= NUMBER_OF_COLUMNS; ++j) {
        const selector = constants.selectors.admission.cell;
        const currentCellSelector = selector
          .replace('{i}', i.toString())
          .replace('{j}', j.toString());
        try {
          const cell = await PuppeteerService.getElementFromWrapperNoWait(
            frame,
            currentCellSelector,
          );

          const text = await cell.evaluate((c) => c.textContent.trim());
          const responseKey = constants.selectors.admission.cells[j];
	  admissionInfo[responseKey] = text;
        } catch (e) {
          thereAreMoreRows = false;
          break;
        }
      }
      if (thereAreMoreRows) {
        admissions.push(admissionInfo);
      }
    }
    return admissions;
  }
}
