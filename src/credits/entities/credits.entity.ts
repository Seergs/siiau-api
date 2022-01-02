import { ApiProperty } from "@nestjs/swagger";

export class AreaCredits {
  constructor(areaCredits: Partial<AreaCredits>) {
    Object.assign(this, areaCredits);
  }

  @ApiProperty({ example: "50" })
  required: string;

  @ApiProperty({ example: "50" })
  aquired: string;

  @ApiProperty({ example: "0" })
  left: string;
}

const mandatoryExample = new AreaCredits({required: "50", aquired: "50", left: "0"})
const selectiveExample = new AreaCredits({required: "16", aquired: "23", left: "0"})
const electiveExample = new AreaCredits({required: "16", aquired: "11", left: "5"})
const commonBasicExample = new AreaCredits({required: "149", aquired: "149", left: "0"})
const particularBasicExample  = new AreaCredits({required: "144", aquired: "144", left: "0"})

export class Credits {
  @ApiProperty({ example: "375"})
  required: string;

  @ApiProperty({ example: "384"})
  aquired: string;

  @ApiProperty({ example: "5"})
  left: string;

  @ApiProperty({ example: mandatoryExample})
  mandatorySpecializedSubject: AreaCredits;

  @ApiProperty({ example: selectiveExample})
  selectiveSpecializedSubject: AreaCredits;

  @ApiProperty({ example: electiveExample})
  electiveSubject: AreaCredits;

  @ApiProperty({ example: commonBasicExample})
  commonBasic: AreaCredits;

  @ApiProperty({ example: particularBasicExample})
  particularBasic: AreaCredits;
}
