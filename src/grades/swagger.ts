import { ApiHeaderOptions, ApiQueryOptions, ApiResponseOptions } from "@nestjs/swagger";
import { CalendarGrades } from "./entities/calendar-grades.entity";

export const RootResponse: ApiResponseOptions = {
    status: 200,
    description:
      'Retrieves the grades per subject of the student from some calendar if specifed. Alternatively you can use the kardex endpoint, will produce the same output',
    type: [CalendarGrades],
  }
  export const RootHeaders: ApiHeaderOptions[] = [
    {
      name: 'x-student-code',
      required: true,
      description:
        'The student ID (code) which is used to authenticate to the SIIAU system',
      example: '217758497',
    },
    {
      name: 'x-student-nip',
      required: true,
      description:
        'The student password (nip) which is used to authenticate to the SIIAU system',
      example: 'mypassword',
    },
  ]
  export const RootQuery: ApiQueryOptions = {
    name: 'calendar',
    type: String,
    example: '18B,2019A,21-B',
    description: 'A comma separated list of calendars to retrieve',
    required: false,
  }
