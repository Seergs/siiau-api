import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiHeaders, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { studentInfoKeys } from './entities/student-info-entity';
import { StudentService } from './student.service';
import { Page } from 'puppeteer';
import { DatabaseService } from '../database/database.service';
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
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @ApiQuery(RootQuery)
  async getStudent(
    @Query() query: Record<string, any>,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    const puppeteerPage = response.locals.page as Page;
    this.databaseService.save('student', request.url);
    return await this.studentService.getStudent(puppeteerPage, paramsRequested);
  }

  @Get('/progress')
  @ApiResponse(ProgressResponse)
  @ApiHeaders(ProgressHeaders)
  async getAcademicProgress(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const puppeteerPage = response.locals.page as Page;
    this.databaseService.save('student', request.url);
    return this.studentService.getAcademicProgress(puppeteerPage);
  }

  @ApiResponse(LoginResponseOk)
  @ApiResponse(LoginResponseError)
  @ApiHeaders(LoginHeaders)
  @Get('/login')
  login() {
    // if the request made it this far, it means the user could login
    // because of the AuthMiddleware so just return
    return;
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
