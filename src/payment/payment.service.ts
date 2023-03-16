import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PaymentInteractor } from './interactors/payment.interactor';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
  ) {}

  async getPaymentOrder(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      const interactor = new PaymentInteractor(this.alerts);
      return await interactor.getPaymentOrder(page);
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student payment order';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }
}
