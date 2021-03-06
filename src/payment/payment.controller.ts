import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('paymentorder')
@Controller('paymentorder')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  getPaymentOrder(@Req() request: Request) {
    return this.paymentService.getPaymentOrder(request);
  }
}
