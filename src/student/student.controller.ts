import { Controller, Get, Logger, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiHeaders, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { studentInfoKeys } from './entities/student-info-entity';
import { StudentService } from './student.service';
import {
  RootResponse,
  RootHeaders,
  RootQuery,
  ProgressResponse,
  ProgressHeaders,
  LoginResponseOk,
  LoginResponseError,
  LoginHeaders,
} from './swagger';

@ApiTags('student')
@Controller({
  version: '1',
  path: 'student',
})
export class StudentController {
  private readonly logger = new Logger('StudentController');
  constructor(private readonly studentService: StudentService) {}

  @Get('/progress')
  @ApiResponse(ProgressResponse)
  @ApiHeaders(ProgressHeaders)
  async getAcademicProgress(
    @Req() request: Request,
    @Query() query: Record<string, any>,
  ) {
    const selectedCareer = this.getSelectedCareer(query['selectedCareer']);
    const response = await this.studentService.getAcademicProgress(
      request,
      selectedCareer,
    );
    this.logger.debug({ data: response }, `Response`);
    return response;
  }

  @ApiResponse(LoginResponseOk)
  @ApiResponse(LoginResponseError)
  @ApiHeaders(LoginHeaders)
  @Get('/login')
  async login(@Req() request: Request) {
    await this.studentService.login(request);
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }

  getSelectedCareer(selectedCareer: string): string {
    return selectedCareer ? selectedCareer.toUpperCase() : null;
  }

  @Get()
  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @ApiQuery(RootQuery)
  async getStudent(
    @Req() request: Request,
    @Query() query: Record<string, any>,
  ) {
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    const selectedCareer = this.getSelectedCareer(query['selectedCareer']);
    const response = await this.studentService.getStudent(
      request,
      paramsRequested,
      selectedCareer,
    );
    this.logger.debug({ data: response }, `Response`);
    return response;
  }
}
