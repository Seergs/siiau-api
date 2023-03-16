import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { AuthModule } from 'src/auth/auth.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [ScheduleController],
  imports: [PuppeteerModule, AuthModule, AlertsModule],
  providers: [ScheduleService],
})
export class ScheduleModule {}
