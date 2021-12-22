import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import constants from '../constants';

@Injectable()
export class AuthService {
  private logger = new Logger();

  async login(page: Page, studentCode: string, studentNip: string) {
    try {
      const loginFrame = PuppeteerService.getFrameFromPage(page, 'mainFrame');
      await loginFrame.type(constants.selectors.login.code, studentCode);
      await loginFrame.type(constants.selectors.login.nip, studentNip);
      await loginFrame.click(constants.selectors.login.button);
      await page.waitForTimeout(1000);
      const homePageFrame = PuppeteerService.getFrameFromPage(page, 'Contenido');
      return (await homePageFrame.content()).includes(
        constants.selectors.home.validator,
      );
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
