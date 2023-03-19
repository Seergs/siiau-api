import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [AuthModule, AlertsModule, CacheModule],
})
export class PaymentModule {}
