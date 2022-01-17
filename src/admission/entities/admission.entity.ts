import { ApiProperty } from '@nestjs/swagger';

export class Admission {
  @ApiProperty({ example: '2017-B' })
  calendar: string;

  @ApiProperty({ example: '' })
  schoolOfOrigin: string;

  @ApiProperty({ example: 'PRIMER INGRESO' })
  admissionType: string;

  @ApiProperty({ example: '82' })
  gpaSchoolOfOrigin: string;

  @ApiProperty({ example: '81.2222' })
  admissionTestScore: string;

  @ApiProperty({ example: '163.2222' })
  admissionScore: string;

  @ApiProperty({ example: '0' })
  personalContribution: string;

  @ApiProperty({ example: 'INGENIERIA EN COMPUTACION' })
  career: string;
}
