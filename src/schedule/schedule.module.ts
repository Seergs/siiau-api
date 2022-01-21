import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  controllers: [ScheduleController],
  imports: [DatabaseModule, PuppeteerModule, AuthModule],
  providers: [ScheduleService],
})
export class ScheduleModule {}
