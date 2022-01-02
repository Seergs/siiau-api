import { ApiHeaderOptions, ApiQueryOptions, ApiResponseOptions } from "@nestjs/swagger";
import { StudentInfo } from "./entities/student-info-entity";
import { StudentProgressResponse } from "./entities/student-progress-entity";

export const RootResponse: ApiResponseOptions = {
    status: 200,
    description: 'Retrieves the general information about the student',
    type: StudentInfo,
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
    name: 'query',
    type: String,
    example: 'name,code',
    description:
      'A comma separated list of the params to be retrieved, in case you want to filter some. If undefined, all properties will be returned. eg (?query=degree,name,status)',
    required: false,
  }
  export const ProgressResponse: ApiResponseOptions = {
    status: 200,
    description:
      'Retrieves the progress of the student by Semester-Calendar/Career/Campus',
    type: StudentProgressResponse,
  }
  export const ProgressHeaders: ApiHeaderOptions[] = [
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
  export const LoginResponseOk: ApiResponseOptions = {
    status: 200,
    description: 'If the credentials are valid and the login is successful',
  }
  export const LoginResponseError: ApiResponseOptions = {
    status: 401,
    description:
      'If the credentials are incorrect and the login was not successful',
  }
  export const LoginHeaders: ApiHeaderOptions[] = [
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
