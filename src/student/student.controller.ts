import {
  Controller,
  Headers,
  Get,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiHeaders, ApiResponse } from '@nestjs/swagger';
import { Student, studentKeys } from './entities/student-entity';
import { StudentService } from './student.service';

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Retrieves the general information about the student',
    type: Student,
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

  parseStudentInfoQuery(query: string): string[] {
    const allParams = studentKeys;
    if (!query) {
      return allParams;
    }
    return query.split(',');
  }
}
