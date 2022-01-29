import { Injectable, Logger } from '@nestjs/common';
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
  async getPaymentOrder(studentCode: string, studentNip: string, url: string) {
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('paymentorder', url);
    this.discordService.sendMessage(
      'Hey! a request was made to ' + this.getPaymentOrder.name,
    );
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
