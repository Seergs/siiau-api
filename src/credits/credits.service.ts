import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreditsInteractor } from './interactors/credits.interactor';
import { AlertService } from 'src/alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);
  private readonly cacheSuffix = 'credits';

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly cache: CacheClient,
  ) {}

  async getCredits(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    const cacheKey = `${studentCode}-${this.cacheSuffix}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached data');
      return JSON.parse(cached);
    }
    try {
      this.logger.debug('Returning fresh data');
      const interactor = new CreditsInteractor(this.alerts);
      const data = await interactor.getCredits(page);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting credits';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
