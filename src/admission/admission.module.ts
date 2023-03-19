import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';
import { AdmissionInteractor } from './interactors/admission.interactor';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  controllers: [AdmissionController],
  providers: [AdmissionService, AdmissionInteractor],
  imports: [PuppeteerModule, AuthModule, AlertsModule, CacheModule],
})
export class AdmissionModule {}
