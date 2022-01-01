import { ApiProperty } from '@nestjs/swagger';

export class StudentProgress {
  constructor() {
    this.calendar = '';
    this.admission = '';
    this.career = '';
    this.campus = '';
    this.campusAlt = '';
    this.gpa = '';
    this.credits = '';
    this.percentage = '';
  }

  @ApiProperty({ example: '2021-B' })
  calendar: string;

  @ApiProperty({ example: '2017-B' })
  admission: string;

  @ApiProperty({
    example: 'INCO',
  })
  career: string;

  @ApiProperty({ example: 'CUCEI' })
  campus: string;

  @ApiProperty({ example: 'CUCEI' })
  campusAlt: string;

  @ApiProperty({ example: '91' })
  gpa: string;

  @ApiProperty({ example: '12' })
  credits: string;

  @ApiProperty({ example: '3.20%' })
  percentage: string;
}

const studentProgressExample = new StudentProgress();
studentProgressExample.calendar = '2017-B';
studentProgressExample.admission = '2017-B';
studentProgressExample.career = 'INCO';
studentProgressExample.campus = 'CUCEI';
studentProgressExample.campusAlt = 'CUCEI';
studentProgressExample.gpa = '86';
studentProgressExample.credits = '36';
studentProgressExample.percentage = '9.60%';

export class StudentProgressTotal {
  @ApiProperty({ example: '90.49' })
  gpa: string;

  @ApiProperty({ example: '384' })
  credits: string;

  @ApiProperty({ example: '102.4%' })
  percentage: string;
}

const studentProgressTotalExample = new StudentProgressTotal();
(studentProgressTotalExample.gpa = '90.49'),
  (studentProgressTotalExample.credits = '384');
studentProgressTotalExample.percentage = '102.4%';

export class StudentProgressResponse {
  constructor(response: Partial<StudentProgressResponse>) {
    Object.assign(this, response);
  }

  @ApiProperty({ example: [studentProgressExample] })
  semesters: StudentProgress[];

  @ApiProperty({ example: studentProgressTotalExample })
  total: StudentProgressTotal;
}

export const studentProgressKeys = Object.keys(new StudentProgress());
