import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { GradesModule } from './grades/grades.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CreditsController } from './credits/credits.controller';
import { CreditsService } from './credits/credits.service';
import { CreditsModule } from './credits/credits.module';
import { AdmissionModule } from './admission/admission.module';
import { ScheduleModule } from './schedule/schedule.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    StudentModule,
    PuppeteerModule,
    GradesModule,
    AuthModule,
    DatabaseModule,
    CreditsModule,
    AdmissionModule,
    ScheduleModule,
    CacheModule.register({
      ttl: 60*10,
    })
  ],
  controllers: [AppController, CreditsController],
  providers: [AppService, PuppeteerService, CreditsService, {
    provide: APP_INTERCEPTOR,
    useClass: CacheInterceptor
  }],
})
export class AppModule {}
