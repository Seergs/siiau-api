import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { GradesModule } from './grades/grades.module';
import { AuthModule } from './auth/auth.module';
import { AnalyticsModule } from './analytics//analytics.module';
import { CreditsController } from './credits/credits.controller';
import { CreditsService } from './credits/credits.service';
import { CreditsModule } from './credits/credits.module';
import { AdmissionModule } from './admission/admission.module';
import { ScheduleModule } from './schedule/schedule.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DiscordModule } from './discord/discord.module';
import { PaymentModule } from './payment/payment.module';
import { HttpCacheInterceptor } from './cache/cache.interceptor';

@Module({
  imports: [
    StudentModule,
    PuppeteerModule,
    GradesModule,
    AuthModule,
    AnalyticsModule,
    CreditsModule,
    AdmissionModule,
    ScheduleModule,
    DiscordModule,
    CacheModule.register({
      ttl: 60 * 10,
    }),
    PaymentModule,
  ],
  controllers: [AppController, CreditsController],
  providers: [
    AppService,
    PuppeteerService,
    CreditsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
