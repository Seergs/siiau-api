import { Controller, Get, Logger, Req } from '@nestjs/common';
import { Request } from 'express';
import { AdmissionService } from './admission.service';

@Controller('v1/admission')
export class AdmissionControllerV1 {
  private readonly logger = new Logger(AdmissionControllerV1.name);
  constructor(private readonly admissionService: AdmissionService) {}

  @Get()
  async getAdmissionInfo(@Req() request: Request) {
    const response = await this.admissionService.getAdmissionInfoV1(request);
    this.logger.debug({ data: response }, 'Response');
    return response;
  }
}
