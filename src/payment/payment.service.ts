import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PaymentInteractor } from './interactors/payment.interactor';
import { AlertService } from 'src/alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly cacheSuffix = 'payment';

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly cache: CacheClient,
  ) {}

  async getPaymentOrder(request: Request) {
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
      const interactor = new PaymentInteractor(this.alerts);
      const data = await interactor.getPaymentOrder(page);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student payment order';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
