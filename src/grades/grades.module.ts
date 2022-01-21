import { Module } from '@nestjs/common';
import { GradesService } from './grades.service';
import { GradesController } from './grades.controller';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { DatabaseModule } from 'src/database/database.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  providers: [GradesService],
  controllers: [GradesController],
  imports: [PuppeteerModule, DatabaseModule, AuthModule],
})
export class GradesModule {}
