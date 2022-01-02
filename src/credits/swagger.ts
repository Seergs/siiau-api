import { ApiHeaderOptions, ApiResponseOptions } from "@nestjs/swagger";
import { Credits } from "./entities/credits.entity";

export const RootResponse: ApiResponseOptions = {
    status: 200,
    description:
      'Retrieves the credits information about the student',
    type: Credits,
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
