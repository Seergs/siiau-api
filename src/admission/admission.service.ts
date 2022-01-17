import { Injectable, Logger } from '@nestjs/common';
import { Page } from 'puppeteer';
import { AdmissionInteractor } from './interactors/admission.interactor';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  async getAdmissionInformation(page: Page) {
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
