import { Controller, Get, Res } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Page } from 'puppeteer';
import { AdmissionService } from './admission.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  getAdmissionInfo(@Res({ passthrough: true }) res: Response) {
    const page = res.locals.page as Page;
    return this.admissionService.getAdmissionInformation(page);
  }
}
