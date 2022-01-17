import { ApiHeaderOptions, ApiResponseOptions } from '@nestjs/swagger';
import { Admission } from './entities/admission.entity';

export const RootResponse: ApiResponseOptions = {
  status: 200,
  description: 'Retrieves the admission information of the student',
  type: [Admission],
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
