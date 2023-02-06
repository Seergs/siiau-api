import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdmissionService } from './admission.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  private readonly logger = new Logger('AdmissionController');
  constructor(private readonly admissionService: AdmissionService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getAdmissionInfo(@Req() request: Request) {
    const response = await this.admissionService.getAdmissionInformation(
      request,
    );
    this.logger.debug(`Response: ${JSON.stringify(response)}`);
    return response;
  }
}
