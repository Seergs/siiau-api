import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  controllers: [AdmissionController],
  providers: [AdmissionService],
  imports: [PuppeteerModule, AuthModule, AlertsModule],
})
export class AdmissionModule {}
