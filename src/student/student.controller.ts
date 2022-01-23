import { Controller, Get, Query, Req } from '@nestjs/common';
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
@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
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
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    return await this.studentService.getStudent(studentCode, studentNip, request.url, paramsRequested);
  }

  @Get('/progress')
  @ApiResponse(ProgressResponse)
  @ApiHeaders(ProgressHeaders)
  async getAcademicProgress(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    return this.studentService.getAcademicProgress(studentCode, studentNip, request.url);
  }

  @ApiResponse(LoginResponseOk)
  @ApiResponse(LoginResponseError)
  @ApiHeaders(LoginHeaders)
  @Get('/login')
  async login(@Req() request: Request) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    await this.studentService.login(studentCode, studentNip);
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
