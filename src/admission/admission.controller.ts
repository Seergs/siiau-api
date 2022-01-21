import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { Page } from 'puppeteer';
import { DatabaseService } from 'src/database/database.service';
import { AdmissionService } from './admission.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  constructor(
    private readonly admissionService: AdmissionService,
    private readonly databaseService: DatabaseService,
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getAdmissionInfo(
    @Res({ passthrough: true }) res: Response,
    @Req() request: Request,
  ) {
    const page = res.locals.page as Page;
    this.databaseService.save('admission', request.url);
    return this.admissionService.getAdmissionInformation(page);
  }
}
