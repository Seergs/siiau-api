require('newrelic');
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { StudentModule } from './student/student.module';
import { GradesModule } from './grades/grades.module';
import { CreditsModule } from './credits/credits.module';
import { AdmissionModule } from './admission/admission.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PaymentModule } from './payment/payment.module';
import * as Sentry from '@sentry/node';
import { SentryInterceptor } from './interceptors/sentry.interceptor';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });

  app.useLogger(app.get(Logger));
  app.enableCors();
  app.useGlobalInterceptors(new SentryInterceptor());
  app.enableVersioning();

  const config = new DocumentBuilder()
    .setTitle('SIIAU API')
    .setDescription('Quickly consume data from the SIIAU system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [
      StudentModule,
      GradesModule,
      CreditsModule,
      AdmissionModule,
      ScheduleModule,
      PaymentModule,
    ],
  });
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
