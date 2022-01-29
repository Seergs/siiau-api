import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import {RootResponse, RootHeaders} from './swagger'

@ApiTags('paymentorder')
@Controller('paymentorder')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
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
