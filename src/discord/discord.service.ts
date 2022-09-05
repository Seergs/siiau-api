import { Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import fetch from 'node-fetch';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  shouldSendDiscordMessage(request: Request): boolean {
    const apiKey = request.headers['x-api-key'];
    const shouldSendMessage = !apiKey || apiKey !== process.env.API_KEY;

    this.logger.log('Should send discord message: ' + shouldSendMessage);
    return shouldSendMessage;
  }

  async sendMessage(request: Request, message: string) {
    if (this.shouldSendDiscordMessage(request)) {
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
      }
    } else {
      this.logger.debug('Api key found and matched, not sending message');
    }
  }
}
