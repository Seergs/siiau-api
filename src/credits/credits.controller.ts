import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly databaseService: DatabaseService,
  ) {}
  @Get()
  async getCredits(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const puppeteerPage = response.locals.page as Page;
    await this.databaseService.save('credits', request.url);
    return this.creditsService.getCredits(puppeteerPage);
  }
}
