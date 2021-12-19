import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectBrowser } from 'nest-puppeteer';
import { Browser, Frame, Page } from 'puppeteer';

@Injectable()
export class PageService {
  constructor(@InjectBrowser() private readonly browser: Browser) {}

  async setUpInitialPage(url: string) {
    const page = await this.browser.newPage();
    await page.goto(url);
    return page;
  }

  static getFrameFromPage(page: Page, frameName: string) {
    const frame = page.frames().find((frame) => frame.name() === frameName);
    if (!frame)
      throw new InternalServerErrorException('No frame found ' + frameName);
    return frame;
  }

  static async getElementFromWrapper(wrapper: Page | Frame, selector: string) {
    const [element] = await wrapper.$x(selector);
    if (!element)
      throw new InternalServerErrorException(`Element ${selector} not found`);
    return element;
  }

  static async clickElementOfWrapper(wrapper: Page | Frame, selector: string) {
    const element = await this.getElementFromWrapper(wrapper, selector);
    await element.click();
  }
}
