import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AdmissionService } from './admission.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getAdmissionInfo(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    return this.admissionService.getAdmissionInformation(
      studentCode,
      studentNip,
      request.url,
    );
  }
}
