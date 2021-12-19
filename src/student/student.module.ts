import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PuppeteerModule } from 'nest-puppeteer';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule.forRoot({ignoreDefaultArgs: ['--no-sandbox', '--disable-setuid-sandbox']   })],
})
export class StudentModule {}
