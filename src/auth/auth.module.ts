import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService],
  imports: [PuppeteerModule],
  exports: [AuthService]
})
export class AuthModule {}
