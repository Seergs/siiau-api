import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';

@Controller('paymentorder')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  getPaymentOrder(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    return this.paymentService.getPaymentOrder(
      studentCode,
      studentNip,
      request.url,
    );
  }
}
