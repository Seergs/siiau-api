import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { CreditsInteractor } from './interactors/credits.interactor';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  async getCredits(page: Page) {
    try {
      const credits = await CreditsInteractor.getCredits(page);
      await page.close();
      return credits;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting credits';
    }
  }
}
