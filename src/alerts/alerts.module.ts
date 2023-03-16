import { Module } from '@nestjs/common';
import { AlertService } from './alerts.service';

@Module({
  providers: [AlertService],
  exports: [AlertService],
})
export class AlertsModule {}
