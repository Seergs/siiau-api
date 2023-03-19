import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { CacheClient } from 'src/cache/cache.client';
import fetch from 'node-fetch';
import { AdmissionParser } from './admission.parser';
import constants from 'src/constants';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  private readonly cacheSuffix = 'admission';
  constructor(
    private readonly authService: AuthService,
    private readonly cache: CacheClient,
  ) {}

  async getAdmissionInfoV1(request: Request) {
    const session = await this.authService.getSession(request);
    this.logger.debug(session, 'Successfully logged in');

    try {
      const cacheKey = `${session.studentCode}-${this.cacheSuffix}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        return JSON.parse(cached);
      }
      this.logger.debug('Returning fresh data');

      const page = await fetch(`${constants.urls.admission}${session.pidm}`, {
        method: 'GET',
        headers: {
          Cookie: session.cookie,
        },
      });
      const pageData = await page.text();
      this.logger.debug(pageData, 'Page data');
      const data = new AdmissionParser(pageData).parse();
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Something went wrong getting the student admission information',
      );
    }
  }
}
