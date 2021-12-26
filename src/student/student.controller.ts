import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiHeaders, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';
import { StudentProgressResponse } from './entities/student-progress-entity';
import { StudentService } from './student.service';
import { Page } from 'puppeteer';
import { DatabaseService } from '../database/database.service';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(
    private readonly studentService: StudentService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieves the general information about the student',
    type: StudentInfo,
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
  @ApiQuery({
    name: 'query',
    type: String,
    example: 'name,code',
    description:
      'A comma separated list of the params to be retrieved, in case you want to filter some. If undefined, all properties will be returned. eg (?query=degree,name,status)',
    required: false,
  })
  async getStudent(
    @Query() query: Record<string, any>,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request
  ) {
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    const puppeteerPage = response.locals.page as Page;
    await this.databaseService.save('student', request.url)
    return await this.studentService.getStudent(puppeteerPage, paramsRequested);
  }

  @Get('/progress')
  @ApiResponse({
    status: 200,
    description:
      'Retrieves the progress of the student by Semester/Career/Campus',
    type: StudentProgressResponse,
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
  async getAcademicProgress(@Res({ passthrough: true }) response: Response, @Req() request: Request) {
    const puppeteerPage = response.locals.page as Page;
    await this.databaseService.save('student', request.url)
    return this.studentService.getAcademicProgress(puppeteerPage);
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
