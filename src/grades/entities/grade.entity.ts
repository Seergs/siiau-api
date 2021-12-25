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
