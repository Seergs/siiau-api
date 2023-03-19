import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Page } from 'puppeteer';
import { AlertService } from 'src/alerts/alerts.service';
import constants from 'src/constants';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import fetch from 'node-fetch';
import { Request } from 'express';

type Session = {
  cookie: string;
  pidm: string;
  studentCode: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly alerts: AlertService,
  ) {}

  async getSession(request: Request): Promise<Session | undefined> {
    this.logger.debug('Logging in with http');
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    try {
      const response = await fetch(constants.urls.login, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: `p_codigo_c=${studentCode}&p_clave_c=${studentNip}`,
        method: 'POST',
      });
      const cookie = response.headers.get('set-cookie');
      const data = await response.text();
      if (data.includes('p_pidm_n')) {
        const pidm = cookie
          .split(',')
          .find((c) => c.includes('SIIAUUDG'))
          .split(';')[0]
          .split('=')[1];
        const cookies = cookie
          .split(',')
          .map((c) => c.split(';')[0])
          .join(';');
        return {
          cookie: cookies,
          pidm,
          studentCode,
        };
      }

      throw new UnauthorizedException('Invalid credentials');
    } catch (e) {
      this.logger.error(e);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(studentCode: string, studentNip: string): Promise<Page> {
    if (!studentCode || !studentNip)
      throw new BadRequestException('Missing auth headers');

    if (studentNip.length > 10)
      throw new BadRequestException('Nip cannot be longer than 10 characters');

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
        await this.alerts.sendErrorAlert(
          page,
          new UnauthorizedException('Login failed'),
        );
        throw new UnauthorizedException('Invalid credentials');
      }
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      throw new UnauthorizedException('Invalid credentials');
    }
  }
}
