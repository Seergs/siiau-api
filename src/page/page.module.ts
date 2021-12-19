import { Module } from '@nestjs/common';
import {PuppeteerModule} from 'nest-puppeteer';
import {PageService} from './page.service';

@Module({
  providers: [PageService],
  exports: [PageService],
  imports: [PuppeteerModule.forRoot()]
})
export class PageModule {}
