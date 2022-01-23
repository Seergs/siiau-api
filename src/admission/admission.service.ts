import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';
import { AdmissionInteractor } from './interactors/admission.interactor';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  constructor(
    private readonly dbService: DatabaseService,
    private readonly authService: AuthService,
  ) {}
  async getAdmissionInformation(
    studentCode: string,
    studentNip: string,
    url: string,
  ) {
    const page = await this.authService.login(studentCode, studentNip);
    this.dbService.save('admission', url);
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
