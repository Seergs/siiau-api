import {
  BadRequestException,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Page } from 'puppeteer';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import constants from '../constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);
  constructor(private readonly puppeteerService: PuppeteerService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const studentCode = req.headers['x-student-code'] as string;
    const studentNip = req.headers['x-student-nip'] as string;
    if (!studentCode || !studentNip)
      throw new BadRequestException('Missing headers');

    const page = await this.puppeteerService.setUpInitialPage(
      constants.urls.homePage,
    );
    const isLoggedIn = await this.login(page, studentCode, studentNip);
    if (!isLoggedIn) throw new UnauthorizedException('Invalid credentials');

    res.locals.page = page;
    next();
  }

  async login(page: Page, studentCode: string, studentNip: string) {
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
      return (await homePageFrame.content()).includes(
        constants.selectors.home.validator,
      );
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }
}
