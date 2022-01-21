import { ApiProperty } from '@nestjs/swagger';

export class Schedule {
  @ApiProperty({ example: '0700-0855' })
  timePeriod: string;

  @ApiProperty({ example: 'Tuesday and Thursday' })
  days: string;

  @ApiProperty({ example: ['M', 'J'] })
  daysKeys: string[];

  @ApiProperty({ example: 'DUCT1' })
  building: string;

  @ApiProperty({ example: 'LC02' })
  classroom: string;

  @ApiProperty({ example: 'VILLASEÑOR PADILLA, CARLOS ALBERTO' })
  teacher: string;

  @ApiProperty({ example: '10-08-2021' })
  dateOfStart: string;

  @ApiProperty({ example: '15-12-2021' })
  dateOfEnd: string;
}

const exampleSchedule = new Schedule();
exampleSchedule.timePeriod = '0700-0855';
exampleSchedule.days = 'Tuesday and Thursday';
exampleSchedule.daysKeys = ['M', 'J'];
exampleSchedule.building = 'DUCT1';
exampleSchedule.classroom = 'LC02';
exampleSchedule.teacher = 'VILLASEÑOR PADILLA, CARLOS ALBERTO';
exampleSchedule.dateOfStart = '10-08-2021';
exampleSchedule.dateOfEnd = '15-12-2021';

export class SubjectSchedule {
  constructor() {
    this.schedules = [];
  }

  @ApiProperty({ example: '140934' })
  nrc: string;

  @ApiProperty({ example: 'I7041' })
  subjectId: string;

  @ApiProperty({
    example: 'SEMINARIO DE SOLUCION DE PROBLEMAS DE INTELIGENCIA ARTIFICIAL II',
  })
  subject: string;

  @ApiProperty({ example: 'D04' })
  section: string;

  @ApiProperty({ example: '5' })
  credits: string;

  @ApiProperty({ example: [exampleSchedule] })
  schedules: Schedule[];
}
