import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { AuthModule } from 'src/auth/auth.module';
import { CacheModule } from 'src/cache/cache.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController],
  imports: [PuppeteerModule, AuthModule, AlertsModule, CacheModule],
})
export class CreditsModule {}
