import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController],
  imports: [DatabaseModule, PuppeteerModule, AuthModule],
})
export class CreditsModule {}
