import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import { Frame, Page } from 'puppeteer';
const AWS = require('aws-sdk');

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);

  async uploadScreenshot(screenshot: string | Buffer) {
    const accessKeyId = process.env.AWS_ACCESS_KEY;
    const secretAccessKey = process.env.AWS_SECRET_KEY;
    const s3 = new AWS.S3({
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    });
    const bucket = 'siiau-api';
    const key = `siiau-api-error-${new Date().toISOString()}.png`;
    this.logger.debug('Uploading screenshot to s3');
    const result = await s3
      .upload({
        Bucket: bucket,
        Key: key,
        Body: screenshot,
        Type: 'image/png',
      })
      .promise();
    this.logger.debug('Screenshot uploaded to s3');
    return result.Location;
  }

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
        this.logger.log('Discord message sent');
      } catch (e) {
        this.logger.error(
          'Something went wrong while sending the message: ' + e,
        );
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
