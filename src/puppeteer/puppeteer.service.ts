import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Frame, Page } from 'puppeteer';
import * as puppeteer from 'puppeteer';

@Injectable()
export class PuppeteerService {
  private browser: puppeteer.Browser;
  private static readonly logger = new Logger(PuppeteerService.name);

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

  static async getElementFromWrapperNoWait(wrapper: Page | Frame, selector: string) {
    try {
      const [element] = await wrapper.$x(selector);
      if (!element)
        throw new InternalServerErrorException(`Element ${selector} not found`);
      return element;
    } catch(e) {
      throw new InternalServerErrorException(e);
    }
  }

  static async getElementFromWrapper(wrapper: Page | Frame, selector: string) {
    let shouldTryAgain = true;
    let retries = 0;
    let element: puppeteer.ElementHandle<Element>;
    while (shouldTryAgain && retries < 5) {
      try {
	element = await this.getElementFromWrapperNoWait(wrapper, selector);
	shouldTryAgain = false;
      } catch(e) {
	retries++;	
	await wrapper.waitForTimeout(1000);
      }
    }
    if (!element) throw new InternalServerErrorException("Element with xpath " + selector + "not found");
    this.logger.log(`Element with xpath ${selector} found after ${retries} retries`);
    return element;
  }

  static async clickElementOfWrapper(wrapper: Page | Frame, selector: string) {
    const element = await this.getElementFromWrapper(wrapper, selector);
    await element.click();
  }

  static async closePage(page: Page) {
    await page.close();
  }
}
