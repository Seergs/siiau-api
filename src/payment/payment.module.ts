import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { DiscordModule } from 'src/discord/discord.module';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  providers: [PaymentService],
  controllers: [PaymentController],
  imports: [DiscordModule, AuthModule, AnalyticsModule],
})
export class PaymentModule {}
