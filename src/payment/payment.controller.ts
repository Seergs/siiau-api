import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('paymentorder')
@Controller('paymentorder')
export class PaymentController {
  private readonly logger = new Logger('PaymentController');
  constructor(private readonly paymentService: PaymentService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getPaymentOrder(@Req() request: Request) {
    const response = await this.paymentService.getPaymentOrder(request);
    this.logger.debug(`Response: ${JSON.stringify(response)}`);
    return response;
  }
}
