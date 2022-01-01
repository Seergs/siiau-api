import { ApiProperty } from '@nestjs/swagger';
import { KardexGrade } from './grade.entity';

export class CalendarGrades {
  constructor(calendarGrades: Partial<CalendarGrades>) {
    Object.assign(this, calendarGrades);
  }

  @ApiProperty({ example: '17 B' })
  calendar: string;

  @ApiProperty({ type: [KardexGrade] })
  grades: KardexGrade[];
}
