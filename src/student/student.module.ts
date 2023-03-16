import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthModule } from 'src/auth/auth.module';
import { AlertsModule } from 'src/alerts/alerts.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule, AuthModule, AlertsModule],
})
export class StudentModule {}
