import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { DiscordModule } from 'src/discord/discord.module';

@Module({
  controllers: [ScheduleController],
  imports: [AnalyticsModule, PuppeteerModule, AuthModule, DiscordModule],
  providers: [ScheduleService],
})
export class ScheduleModule {}
