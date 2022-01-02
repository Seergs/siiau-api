import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import { CreditsService } from './credits.service';
import { Credits } from './entities/credits.entity';

@ApiTags("credits")
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly databaseService: DatabaseService,
  ) {}

  @ApiResponse({
    status: 200,
    description:
      'Retrieves the credits information about the student',
    type: Credits,
  })
  @ApiHeaders([
    {
      name: 'x-student-code',
      required: true,
      description:
        'The student ID (code) which is used to authenticate to the SIIAU system',
      example: '217758497',
    },
    {
      name: 'x-student-nip',
      required: true,
      description:
        'The student password (nip) which is used to authenticate to the SIIAU system',
      example: 'mypassword',
    },
  ])
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
