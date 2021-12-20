import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PuppeteerModule } from 'nest-puppeteer';
import {PageModule} from 'src/page/page.module';
import {AuthModule} from 'src/auth/auth.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule.forRoot(), PageModule, AuthModule],
})
export class StudentModule {}
