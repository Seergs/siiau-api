import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  providers: [CreditsService],
  controllers: [CreditsController],
  imports: [PuppeteerModule, AuthModule],
})
export class CreditsModule {}
