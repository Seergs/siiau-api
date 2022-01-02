import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AdmissionService } from './admission.service';
import { AdmissionController } from './admission.controller';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';

@Module({
  controllers: [AdmissionController],
  providers: [AdmissionService],
  imports: [DatabaseModule, PuppeteerModule]
})
export class AdmissionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('admission');
  }
}
