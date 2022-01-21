import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [StudentController],
  providers: [StudentService],
  imports: [PuppeteerModule, DatabaseModule, AuthModule],
})
export class StudentModule {}
