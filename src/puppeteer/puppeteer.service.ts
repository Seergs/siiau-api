import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private browser: puppeteer.Browser;

  constructor() {
    this.setupBrowser();
  }

  async setupBrowser() {
    this.browser = await puppeteer.launch({
      args: ['--no-sandbox','--disable-setuid-sandbox']
    });
  }

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
    try {
      const [element] = await wrapper.$x(selector);
      if (!element)
        throw new InternalServerErrorException(`Element ${selector} not found`);
      return element;
    } catch(e) {
      console.log(e)
      throw new InternalServerErrorException(e);
    }
  }

  static async clickElementOfWrapper(wrapper: Page | Frame, selector: string) {
    const element = await this.getElementFromWrapper(wrapper, selector);
    await element.click();
  }

  static async closePage(page: Page) {
    await page.close();
  }
}
