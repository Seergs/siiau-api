export class Payment {
  account: string;
  concept: string;
  description: string;
  date: string;
  expirationDate: string;
  amount: string;
}

export class PaymentResponse {
  constructor(paymentResponse: Partial<PaymentResponse>) {
    Object.assign(this, paymentResponse);
  }
  payments: Payment[];
  total: string;
}
