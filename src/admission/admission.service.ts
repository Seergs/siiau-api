import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AdmissionInteractor } from './interactors/admission.interactor';
import { Request } from 'express';
import { AlertService } from '../alerts/alerts.service';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly interactor: AdmissionInteractor,
  ) {}

  async getAdmissionInformation(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      return await this.interactor.getAdmissionInformation(page);
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student admission information';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
