export class SubjectSchedule {
  constructor() {
    this.schedules = [];
  }

  nrc: string;
  subjectId: string;
  subject: string;
  section: string;
  credits: string;
  schedules: Schedule[];
}

export class Schedule {
  timePeriod: string;
  days: string;
  daysKeys: string[];
  building: string;
  classroom: string;
  teacher: string;
  dateOfStart: string;
  dateOfEnd: string;
}
