import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { CreditsInteractor } from './interactors/credits.interactor';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
  ) {}

  async getCredits(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      const interactor = new CreditsInteractor(this.alerts);
      return await interactor.getCredits(page);
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
