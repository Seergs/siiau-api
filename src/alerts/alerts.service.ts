import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import { Page } from 'puppeteer';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  shouldSendUsageAlert(request: Request): boolean {
    const apiKey = request.headers['x-api-key'];
    const shouldSendMessage = !apiKey || apiKey !== process.env.API_KEY;

    this.logger.log('Should send discord message: ' + shouldSendMessage);
    return shouldSendMessage;
  }

  async sendUsageAlert(request: Request, message: string) {
    if (this.shouldSendUsageAlert(request)) {
      const environment = process.env.NODE_ENV;
      const formattedMessage =
        environment === 'production' ? `@everyone ${message}` : message;

      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: formattedMessage }),
        });
        this.logger.debug(
          { message: formattedMessage },
          'Usage alert message sent',
        );
      } catch (e) {
        this.logger.error({ error: e }, 'Error sending usage alert message');
        Sentry.captureException(e);
      }
    } else {
      this.logger.debug('Api key found and matched, not sending message');
    }
  }

  async sendErrorAlert(page: Page, e: Error) {
    const screenshot = await page.screenshot({ fullPage: true });
    Sentry.configureScope((s) => {
      const attachment = {
        data: screenshot,
        filename: 'screenshot.png',
        contentType: 'image/png',
      };
      s.addAttachment(attachment);
    });
    Sentry.captureException(e);
  }
}
