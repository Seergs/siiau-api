import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AuthService } from 'src/auth/auth.service';
import { DiscordService } from 'src/discord/discord.service';
import { CreditsInteractor } from './interactors/credits.interactor';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly authService: AuthService,
    private readonly discordService: DiscordService,
  ) {}

  async getCredits(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('credits', request.url);
    if (this.discordService.shouldSendDiscordMessage(request)) {
      this.discordService.sendMessage(
	'Hey! a request was made to ' + this.getCredits.name,
      );
    }
    try {
      const credits = await CreditsInteractor.getCredits(page);
      await page.close();
      return credits;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting credits';
    }
  }
}
