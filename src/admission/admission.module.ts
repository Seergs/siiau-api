import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { AnalyticsModule } from '../analytics/analytics.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
  controllers: [AdmissionController],
  providers: [AdmissionService],
  imports: [AnalyticsModule, PuppeteerModule, AuthModule, DiscordModule],
})
export class AdmissionModule {}
