import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { AuthModule } from './auth/auth.module';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerModule } from './puppeteer/puppeteer.module';

@Module({
  imports: [StudentModule, PuppeteerModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PuppeteerService ],
})
export class AppModule {}
