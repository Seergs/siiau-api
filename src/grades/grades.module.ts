import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [GradesService],
  controllers: [GradesController],
  imports: [PuppeteerModule, AnalyticsModule, AuthModule],
})
export class GradesModule {}
