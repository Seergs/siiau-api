import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  providers: [GradesService],
  controllers: [GradesController],
  imports: [PuppeteerModule, AuthModule, AlertsModule, CacheModule],
})
export class GradesModule {}
