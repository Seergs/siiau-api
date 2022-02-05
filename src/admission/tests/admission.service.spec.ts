import { Test } from '@nestjs/testing';
import { AdmissionService } from '../admission.service';

class ApiServiceMock {
  getAdmissionInformation() {
    return [];
  }
}

describe.only('AdmissionService', () => {
  let admissionService: AdmissionService;

  beforeAll(async () => {
    const ApiServiceProvider = {
      provide: AdmissionService,
      useClass: ApiServiceMock,
    };

    const moduleRef = await Test.createTestingModule({
      providers: [AdmissionService, ApiServiceProvider],
    }).compile();

    admissionService = moduleRef.get<AdmissionService>(AdmissionService);
  });

  it('should call getAdmissionInfo with expected params', async () => {
    const getAdmissionInfoSpy = jest.spyOn(
      admissionService,
      'getAdmissionInformation',
    );
    const req = {
      headers: {
        'x-student-code': 'mycode',
        'x-student-nip': 'mynip',
      },
      url: 'admission',
    };
    admissionService.getAdmissionInformation(req as any);
    expect(getAdmissionInfoSpy).toHaveBeenCalledWith(req);
  });
});
