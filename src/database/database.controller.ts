import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}
  @Get('/analytics')
  getAll() {
    return this.databaseService.getAll();
  }
  @Get('/analytics/summary')
  getSummary() {
    return this.databaseService.getSummary();
  }
}
