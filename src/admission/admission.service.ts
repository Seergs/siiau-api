import { Injectable, Logger } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AdmissionInteractor } from './interactors/admission.interactor';
import { DiscordService } from 'src/discord/discord.service';

@Injectable()
export class AdmissionService {
  private readonly logger = new Logger(AdmissionService.name);
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly authService: AuthService,
    private readonly discordService: DiscordService,
  ) {}
  async getAdmissionInformation(
    studentCode: string,
    studentNip: string,
    url: string,
  ) {
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('admission', url);
    this.discordService.sendMessage(
      'Hey! a request was made to ' + this.getAdmissionInformation.name,
    );
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
