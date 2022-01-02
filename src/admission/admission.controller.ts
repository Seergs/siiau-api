import { Controller, Get, Res } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Page } from 'puppeteer';
import { AdmissionService } from './admission.service';
import { Admission } from './entities/admission.entity';

@ApiTags("admission")
@Controller('admission')
export class AdmissionController {
  constructor(private readonly admissionService: AdmissionService) {}

  @ApiResponse({
    status: 200,
    description:
      'Retrieves the admission information of the student',
    type: [Admission],
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
  getAdmissionInfo(@Res({ passthrough: true }) res: Response) {
    const page = res.locals.page as Page
    return this.admissionService.getAdmissionInformation(page);
  }
}
