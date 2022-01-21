import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Page } from 'puppeteer';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly puppeteerService: PuppeteerService) {}
  async login(studentCode: string, studentNip: string): Promise<Page> {
    if (!studentCode || !studentNip)
      throw new BadRequestException('Missing auth headers');

    if (studentNip.length > 10) throw new BadRequestException("Nip cannot be longer than 10 characters")

    const page = await this.puppeteerService.setUpInitialPage(
      constants.urls.homePage,
    );

    try {
      await page.waitForTimeout(2000);
      const loginFrame = await PuppeteerService.getFrameFromPage(
        page,
        'mainFrame',
      );
      await loginFrame.type(constants.selectors.login.code, studentCode);
      await loginFrame.type(constants.selectors.login.nip, studentNip);
      await loginFrame.click(constants.selectors.login.button);
      await page.waitForTimeout(2000);
      const homePageFrame = await PuppeteerService.getFrameFromPage(
        page,
        'Contenido',
      );
      if (
        (await homePageFrame.content()).includes(
          constants.selectors.home.validator,
        )
      ) {
        return page;
      } else {
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (e) {
      this.logger.error(e);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
