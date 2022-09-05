import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AnalyticsService } from '../analytics/analytics.service';
import { DiscordService } from '../discord/discord.service';

@Injectable()
export class Middleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly discordService: DiscordService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl } = request;
    response.on('close', () => {
      const { statusCode } = response;
      this.logger.debug(`${method} ${originalUrl} ${statusCode}`);

      if (statusCode < 300 && !originalUrl.includes('health')) {
        const apiRoute = originalUrl.split('/')[1];
        this.logger.debug(
          `Saving analytic: {controller=${apiRoute}, path=${originalUrl}}`,
        );
        this.analyticsService.save(apiRoute, originalUrl);

        this.logger.debug('Sending discord message');
        this.discordService.sendMessage(
          request,
          'Hey! a request was made to ' + apiRoute,
        );
      }
    });

    next();
  }
}