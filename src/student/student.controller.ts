import { Controller, Get, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiHeaders, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { studentInfoKeys } from './entities/student-info-entity';
import { StudentService } from './student.service';
import { AnalyticsService } from '../analytics/analytics.service';
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
import { AuthService } from 'src/auth/auth.service';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly databaseService: AnalyticsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @ApiQuery(RootQuery)
  async getStudent(
    @Query() query: Record<string, any>,
    @Req() request: Request,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    this.databaseService.save('student', request.url);
    return await this.studentService.getStudent(page, paramsRequested);
  }

  @Get('/progress')
  @ApiResponse(ProgressResponse)
  @ApiHeaders(ProgressHeaders)
  async getAcademicProgress(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.databaseService.save('student', request.url);
    return this.studentService.getAcademicProgress(page);
  }

  @ApiResponse(LoginResponseOk)
  @ApiResponse(LoginResponseError)
  @ApiHeaders(LoginHeaders)
  @Get('/login')
  async login(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    await this.authService.login(studentCode, studentNip);
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
