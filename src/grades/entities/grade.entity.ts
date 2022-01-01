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

export class KardexGrade {
  nrc: string;
  subjectId: string;
  subject: string;
  grade: string;
  type: string;
  credits: number;
  date: string;
  extra?: ExtraKardexData;
}

export class ExtraKardexData {
  grade: string;
  type: string;
  credits: string;
  date: string;
}
