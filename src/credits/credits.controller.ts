import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import { CreditsService } from './credits.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly databaseService: DatabaseService,
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getCredits(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const puppeteerPage = response.locals.page as Page;
    this.databaseService.save('credits', request.url);
    return this.creditsService.getCredits(puppeteerPage);
  }
}
