import { Injectable, Logger } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class DiscordService {
  private readonly logger = new Logger(DiscordService.name);

  async sendMessage(message: string) {
    const environment = process.env.NODE_ENV;
    const formattedMessage =
      environment === 'production' ? `@everyone ${message}` : message;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: formattedMessage }),
    });
    this.logger.log('Sent discord message for env' + environment);
  }
}
