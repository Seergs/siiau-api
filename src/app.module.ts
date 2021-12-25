import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { GradesModule } from './grades/grades.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [StudentModule, PuppeteerModule, GradesModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PuppeteerService ],
})
export class AppModule {}
