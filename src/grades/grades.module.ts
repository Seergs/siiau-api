import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import {PuppeteerModule} from 'src/puppeteer/puppeteer.module';
import {AuthMiddleware} from 'src/auth/auth.middleware';

@Module({
  providers: [GradesService],
  controllers: [GradesController],
  imports: [PuppeteerModule]
})
export class GradesModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('grades')
  } 
}
