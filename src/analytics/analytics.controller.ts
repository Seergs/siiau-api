import { Controller, Get, Headers, ForbiddenException } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('database')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @Get('/')
  getAll(@Headers('x-api-key') apiKey: string) {
    if (!apiKey) throw new ForbiddenException('No API key provided');
    if (apiKey !== process.env.API_KEY)
      throw new ForbiddenException('Invalid API key');
    return this.analyticsService.getAll();
  }
  @Get('/summary')
  getSummary(@Headers('x-api-key') apiKey: string) {
    if (!apiKey) throw new ForbiddenException('No API key provided');
    if (apiKey !== process.env.API_KEY)
      throw new ForbiddenException('Invalid API key');
    return this.analyticsService.getSummary();
  }
}
