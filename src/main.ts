import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { config } from 'dotenv';
import { StudentModule } from './student/student.module';
import { GradesModule } from './grades/grades.module';
import { CreditsModule } from './credits/credits.module';
import { AdmissionModule } from './admission/admission.module';
import { ScheduleModule } from './schedule/schedule.module';
import { PaymentModule } from './payment/payment.module';
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

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
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { defaultModelsExpandDepth: -1 },
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
