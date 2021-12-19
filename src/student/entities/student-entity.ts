import { ApiProperty } from '@nestjs/swagger';

export class Student {
  constructor() {
    this.code= '';
    this.name = ''
    this.campus = ''
    this.career = ''
    this.degree = ''
    this.status = ''
    this.location = ''
    this.lastSemester = ''
    this.admissionDate = ''
  }

  @ApiProperty({ example: '217758497' })
  code: string;

  @ApiProperty({ example: 'SERGIO SUAREZ ALVAREZ' })
  name: string;

  @ApiProperty({
    example: 'CENTRO UNIVERSITARIO DE CIENCIAS EXACTAS E INGENIERIAS',
  })
  campus: string;

  @ApiProperty({ example: 'INGENIERIA EN COMPUTACION (INCO)' })
  career: string;

  @ApiProperty({ example: 'LICENCIATURA' })
  degree: string;

  @ApiProperty({ example: 'ACTIVO' })
  status: string;

  @ApiProperty({ example: 'CAMPUS TECNOLOGICO GDL' })
  location: string;

  @ApiProperty({ example: '2021B' })
  lastSemester: string;

  @ApiProperty({ example: '2017B' })
  admissionDate: string;
}

export const studentKeys = Object.keys(new Student());
