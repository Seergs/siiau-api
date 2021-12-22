import {
  Controller,
  Headers,
  Get,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiHeaders, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';
import {StudentProgress, StudentProgressResponse, StudentProgressTotal} from './entities/student-progress-entity';
import { StudentService } from './student.service';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

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
  getStudent(@Headers() headers: any, @Query() query: Record<string, any>) {
    const studentCode = headers['x-student-code'];
    const studentNip = headers['x-student-nip'];
    const paramsRequested = this.parseStudentInfoQuery(query['query']);
    if (!studentCode || !studentNip)
      throw new BadRequestException('Missing headers');
    return this.studentService.getStudent(
      studentCode,
      studentNip,
      paramsRequested,
    );
  }

  @Get('/progress')
  @ApiResponse({
    status: 200,
    description: 'Retrieves the progress of the student by Semester/Career/Campus',
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
  getAcademicProgress(@Headers() headers: any) {
    const studentCode = headers['x-student-code'];
    const studentNip = headers['x-student-nip'];
    return this.studentService.getAcademicProgress(studentCode, studentNip);
  }

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentInfoKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
