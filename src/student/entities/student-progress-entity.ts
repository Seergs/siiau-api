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

export class StudentProgressTotal {
  @ApiProperty({ example: '90.49' })
  gpa: string;

  @ApiProperty({ example: '384' })
  credits: string;

  @ApiProperty({ example: '102.4%' })
  percentage: string;
}

export class StudentProgressResponse {
  constructor(response: Partial<StudentProgressResponse>) {
    Object.assign(this, response);
  }

  @ApiProperty({ example: [new StudentProgress()], isArray: true })
  semesters: StudentProgress[];

  @ApiProperty({ example: new StudentProgressTotal() })
  total: StudentProgressTotal;
}

export const studentProgressKeys = Object.keys(new StudentProgress());
