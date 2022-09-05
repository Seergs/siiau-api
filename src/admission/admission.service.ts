import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AdmissionInteractor } from './interactors/admission.interactor';
import { Request } from 'express';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  constructor(private readonly authService: AuthService) {}

  async getAdmissionInformation(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      const admission = await AdmissionInteractor.getAdmissionInformation(page);
      await page.close();
      return admission;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student admission information';
    }
  }
}
