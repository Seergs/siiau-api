import { Controller, Get, Headers, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}
  @Get('/analytics')
  getAll(@Headers("x-api-key") apiKey: string) {
    if (!apiKey) throw new ForbiddenException("No API key provided");
    if (apiKey !== process.env.API_KEY) throw new ForbiddenException("Invalid API key");
    return this.databaseService.getAll();
  }
  @Get('/analytics/summary')
  getSummary(@Headers("x-api-key") apiKey: string) {
    if (!apiKey) throw new ForbiddenException("No API key provided");
    if (apiKey !== process.env.API_KEY) throw new ForbiddenException("Invalid API key");
    return this.databaseService.getSummary();
  }
}
