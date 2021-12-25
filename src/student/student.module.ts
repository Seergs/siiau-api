import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import {PuppeteerModule} from 'src/puppeteer/puppeteer.module';
import {AuthMiddleware} from 'src/auth/auth.middleware';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule],
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('student')
  } 
}
