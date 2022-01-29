import { ApiProperty } from '@nestjs/swagger';

export class Payment {
  @ApiProperty({ example: '67906524' })
  account: string;

  @ApiProperty({ example: '0608' })
  concept: string;

  @ApiProperty({ example: 'DESARRCUCEI/CH/086-2004/INCO/22A' })
  description: string;

  @ApiProperty({ example: '16/01/2022' })
  date: string;

  @ApiProperty({ example: '17/02/2022' })
  expirationDate: string;

  @ApiProperty({ example: '$1,210.00' })
  amount: string;
}

const paymentExample = new Payment();
paymentExample.account = '67906524';
paymentExample.concept = '0608';
paymentExample.description = 'DESARRCUCEI/CH/086-2004/INCO/22A';
paymentExample.date = '16/01/2022';
paymentExample.expirationDate = '17/02/2022';
paymentExample.amount = '$1,210.00';

export class PaymentResponse {
  constructor(paymentResponse: Partial<PaymentResponse>) {
    Object.assign(this, paymentResponse);
  }

  @ApiProperty({ example: [paymentExample] })
  payments: Payment[];

  @ApiProperty({ example: '$1,473.00' })
  total: string;
}
