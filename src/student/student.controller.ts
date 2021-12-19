import { Controller, Headers, Get } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  getStudent(@Headers() headers: any) {
    const studentCode = headers['x-student-code'];
    const studentNip = headers['x-student-nip'];
    return this.studentService.getStudent(studentCode, studentNip);
  }
}
