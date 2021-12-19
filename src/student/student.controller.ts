import { Controller, Headers, Get, BadRequestException } from '@nestjs/common';
import {
  ApiTags,
  ApiHeaders,
  ApiResponse,
} from '@nestjs/swagger';
import {Student} from './entities/student-entity';
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
  getStudent(@Headers() headers: any) {
    const studentCode = headers['x-student-code'];
    const studentNip = headers['x-student-nip'];
    if (!studentCode || !studentNip) throw new BadRequestException('Missing headers')
    return this.studentService.getStudent(studentCode, studentNip);
  }
}
