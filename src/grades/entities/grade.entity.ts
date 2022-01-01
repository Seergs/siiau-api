import { ApiProperty } from '@nestjs/swagger';

export class Grade {
  constructor() {
    this.regularGrade = new BaseGrade();
    this.extraGrade = new BaseGrade();
  }
  nrc: string;
  id: string;
  subject: string;
  regularGrade: BaseGrade;
  extraGrade: BaseGrade;
}

export class BaseGrade {
  grade: string;
  isInKardex: boolean;
}

export class ExtraKardexData {
  @ApiProperty({ example: 'SD (SIN DERECHO)' })
  grade: string;

  @ApiProperty({ example: 'EXTRAORDINARIO (E)' })
  type: string;

  @ApiProperty({ example: '0' })
  credits: string;

  @ApiProperty({ example: '04/JUN/2019' })
  date: string;
}

const extraKardexDataExample = new ExtraKardexData();
extraKardexDataExample.type = 'EXTRAORDINARIO (E)';
extraKardexDataExample.grade = 'SD (SIN DERECHO)';
extraKardexDataExample.credits = '0';
extraKardexDataExample.date = '04/JUN/2019';

export class KardexGrade {
  @ApiProperty({ example: '43735' })
  nrc: string;

  @ApiProperty({ example: 'I7022' })
  subjectId: string;

  @ApiProperty({ example: 'FUNDAMENTOS FILOSOFICOS DE LA COMPUTACION' })
  subject: string;

  @ApiProperty({ example: '97 (NOVENTA Y SIETE)' })
  grade: string;

  @ApiProperty({ example: 'ORDINARIO (OE)' })
  type: string;

  @ApiProperty({ example: '8' })
  credits: string;

  @ApiProperty({ example: '11/DIC/2019' })
  date: string;

  @ApiProperty({ required: false, example: extraKardexDataExample })
  extra?: ExtraKardexData;
}
