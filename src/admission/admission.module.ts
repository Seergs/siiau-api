import { Module } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AdmissionController],
  providers: [AdmissionService],
  imports: [DatabaseModule, PuppeteerModule, AuthModule],
})
export class AdmissionModule {}
