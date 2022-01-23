import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule, AnalyticsModule, AuthModule],
})
export class StudentModule {}
