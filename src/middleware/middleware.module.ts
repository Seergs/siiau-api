import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [AnalyticsModule, DiscordModule],
})
export class MiddlewareModule {}
