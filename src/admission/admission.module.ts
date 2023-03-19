import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionControllerV1 } from './admission.controller.v1';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [AdmissionControllerV1],
  providers: [AdmissionService],
  imports: [PuppeteerModule, AuthModule, AlertsModule, CacheModule],
})
export class AdmissionModule {}
