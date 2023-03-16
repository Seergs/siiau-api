import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [AuthModule, AlertsModule],
})
export class PaymentModule {}
