import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PaymentInteractor } from './interactors/payment.interactor';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(private readonly authService: AuthService) {}

  async getPaymentOrder(request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
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
