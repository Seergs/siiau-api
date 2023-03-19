import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AdmissionInteractor } from './interactors/admission.interactor';
import { Request } from 'express';
import { AlertService } from '../alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  private readonly cacheSuffix = 'admission';
  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly interactor: AdmissionInteractor,
    private readonly cache: CacheClient,
  ) {}

  async getAdmissionInformation(request: Request) {
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
      const data = await this.interactor.getAdmissionInformation(page);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      throw new InternalServerErrorException(
        'Something went wrong getting the student admission information',
      );
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
