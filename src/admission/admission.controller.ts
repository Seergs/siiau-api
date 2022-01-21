import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import {  Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';
import { AdmissionService } from './admission.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('admission')
@Controller('admission')
export class AdmissionController {
  constructor(
    private readonly admissionService: AdmissionService,
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getAdmissionInfo(
    @Req() request: Request,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.databaseService.save('admission', request.url);
    return this.admissionService.getAdmissionInformation(page);
  }
}
