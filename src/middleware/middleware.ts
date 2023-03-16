import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AnalyticsService } from '../analytics/analytics.service';
import { AlertService } from '../alerts/alerts.service';

const ignoredPaths = ['health', 'database'];

@Injectable()
export class Middleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly alertService: AlertService,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    const { method, originalUrl } = request;
    response.on('close', () => {
      const { statusCode } = response;
      this.logger.debug(`${method} ${originalUrl} ${statusCode}`);

      const isOkResponse = statusCode < 300;

      if (!isOkResponse || this.shouldIgnorePath(originalUrl)) {
        this.logger.debug(`Path ${originalUrl} wont be stored as analytic`);
      } else {
        const apiRoute = originalUrl.split('/')[1];
        this.logger.debug(
          `Saving analytic: {controller=${apiRoute}, path=${originalUrl}}`,
        );
        this.analyticsService.save(apiRoute, originalUrl);

        this.logger.debug('Sending discord message');
        this.alertService.sendUsageAlert(
          request,
          'Hey! a request was made to ' + apiRoute,
        );
      }
    });

    next();
  }

  shouldIgnorePath(url: string) {
    return ignoredPaths.some((v) => url.includes(v));
  }
}
