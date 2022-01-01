import { Module } from '@nestjs/common';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AuthMiddleware } from './auth.middleware';

@Module({
  providers: [AuthMiddleware],
  imports: [PuppeteerModule],
})
export class AuthModule {}
