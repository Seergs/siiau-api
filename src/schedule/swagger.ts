import {
  ApiHeaderOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';
import { SubjectSchedule } from './entities/schedule.entity';

export const RootResponse: ApiResponseOptions = {
  status: 200,
  description:
    'Retrieves the schedule of the student from some calendar if specifed. If no calendar passed, then return the last calendar schedule',
  type: [SubjectSchedule],
};
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
];
export const RootQuery: ApiQueryOptions = {
  name: 'calendar',
  type: String,
  example: '18B',
  description: 'Calendar to retrieve the schedule for',
  required: false,
};
