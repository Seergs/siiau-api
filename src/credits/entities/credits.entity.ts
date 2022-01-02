export class AreaCredits {
  constructor(areaCredits: Partial<AreaCredits>) {
    Object.assign(this, areaCredits);
  }
  required: string;
  aquired: string;
  left: string;
}

export class Credits {
  required: string;
  aquired: string;
  left: string;
  mandatorySpecializedSubject: AreaCredits;
  selectiveSpecializedSubject: AreaCredits;
  electiveSubject: AreaCredits;
  commonBasic: AreaCredits;
  particularBasic: AreaCredits;
}
