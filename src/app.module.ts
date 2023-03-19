import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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
import { AlertsModule } from './alerts/alerts.module';
import { PaymentModule } from './payment/payment.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health/health.controller';
import { Middleware } from './middleware/middleware';
import { MiddlewareModule } from './middleware/middleware.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Analytic } from './model/analytic.model';
import { config } from 'dotenv';
import { LoggerModule } from 'nestjs-pino';
import { CacheModule } from './cache/cache.module';

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
    PaymentModule,
    ScheduleModule.forRoot(),
    MiddlewareModule,
    CacheModule,
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
  providers: [PuppeteerService, CreditsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(Middleware).forRoutes('*');
  }
}
