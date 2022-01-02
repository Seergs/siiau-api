import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { Page } from 'puppeteer';
import { AdmissionService } from './admission.service';

@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @Get()
  getAdmissionInfo(@Res({ passthrough: true }) res: Response) {
    const page = res.locals.page as Page
    return this.admissionService.getAdmissionInformation(page);
  }
}
