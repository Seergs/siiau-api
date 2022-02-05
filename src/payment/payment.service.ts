import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AuthService } from 'src/auth/auth.service';
import { DiscordService } from 'src/discord/discord.service';
import { PaymentInteractor } from './interactors/payment.interactor';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly discordService: DiscordService,
  ) {}
  async getPaymentOrder(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('paymentorder', request.url);
    if (this.discordService.shouldSendDiscordMessage(request)) {
      this.discordService.sendMessage(
        'Hey! a request was made to ' + this.getPaymentOrder.name,
      );
    }
    try {
      const paymentOrder = await PaymentInteractor.getPaymentOrder(page);
      await page.close();
      return paymentOrder;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student payment order';
    }
  }
}
