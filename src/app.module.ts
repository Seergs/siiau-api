import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
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
import { ScheduleModule as UserScheduleModule } from './schedule/schedule.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AlertsModule } from './alerts/alerts.module';
import { PaymentModule } from './payment/payment.module';
import { HttpCacheInterceptor } from './cache/cache.interceptor';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { Middleware } from './middleware/middleware';
import { MiddlewareModule } from './middleware/middleware.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Analytic } from './model/analytic.model';
import { config } from 'dotenv';
import { LoggerModule } from 'nestjs-pino';

config();

@Module({
  imports: [
    StudentModule,
    PuppeteerModule,
    GradesModule,
    AuthModule,
    AnalyticsModule,
    CreditsModule,
    AdmissionModule,
    UserScheduleModule,
    AlertsModule,
    CacheModule.register({
      ttl: 60 * 10,
    }),
    PaymentModule,
    ScheduleModule.forRoot(),
    MiddlewareModule,
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DATABASE_HOST,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      logging: false,
      models: [Analytic],
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'debug',
        redact: {
          paths: ['req.headers'],
        },
      },
    }),
  ],
  controllers: [CreditsController, HealthController],
  providers: [
    PuppeteerService,
    CreditsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Middleware).forRoutes('*');
  }
}
