import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [AnalyticsModule, AlertsModule],
})
export class MiddlewareModule {}
