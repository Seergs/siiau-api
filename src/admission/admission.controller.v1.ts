import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdmissionService } from './admission.service';
import { RootHeaders, RootResponse } from './swagger';

@ApiTags('admission')
@Controller({
  version: '1',
  path: 'admission',
})
export class AdmissionControllerV1 {
  private readonly logger = new Logger(AdmissionControllerV1.name);
  constructor(private readonly admissionService: AdmissionService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getAdmissionInfo(@Req() request: Request) {
    const response = await this.admissionService.getAdmissionInfoV1(request);
    this.logger.debug({ data: response }, 'Response');
    return response;
  }
}
