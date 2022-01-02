import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StudentModule } from './student/student.module';
import { PuppeteerService } from './puppeteer/puppeteer.service';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { GradesModule } from './grades/grades.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { CreditsController } from './credits/credits.controller';
import { CreditsService } from './credits/credits.service';
import { CreditsModule } from './credits/credits.module';

@Module({
  imports: [
    StudentModule,
    PuppeteerModule,
    GradesModule,
    AuthModule,
    DatabaseModule,
    CreditsModule,
  ],
  controllers: [AppController, CreditsController],
  providers: [AppService, PuppeteerService, CreditsService],
})
export class AppModule {}
