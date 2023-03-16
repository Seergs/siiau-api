import { Module } from '@nestjs/common';
import { AlertsModule } from 'src/alerts/alerts.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  imports: [PuppeteerModule, AlertsModule],
  exports: [AuthService],
})
export class AuthModule {}
