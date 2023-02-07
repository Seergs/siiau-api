import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreditsInteractor } from './interactors/credits.interactor';
import * as Sentry from '@sentry/node';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly authService: AuthService) {}

  async getCredits(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      const credits = await CreditsInteractor.getCredits(page);
      await page.close();
      return credits;
    } catch (e) {
      this.logger.error(e);
      Sentry.captureException(e);
      return 'Something went wrong getting credits';
    }
  }
}
