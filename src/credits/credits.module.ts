import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController],
  imports: [AnalyticsModule, PuppeteerModule, AuthModule],
})
export class CreditsModule {}
