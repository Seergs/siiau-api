import { Test } from '@nestjs/testing';
import { AdmissionController } from '../admission.controller';
import { AdmissionService } from '../admission.service';

describe('AdmissionController', () => {
  let admissionController: AdmissionController;
  let admissionService: AdmissionService;
  const req: any = {
    headers: {
      'x-student-code': '2177584987',
      'x-student-nip': 'password',
    },
  };

  beforeAll(async () => {
    const ApiServiceProvider = {
      provide: AdmissionService,
      useFactory: () => ({
        getAdmissionInformation: jest.fn(() => []),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdmissionController],
      providers: [AdmissionService, ApiServiceProvider],
    }).compile();
    admissionService = moduleRef.get<AdmissionService>(AdmissionService);
    admissionController =
      moduleRef.get<AdmissionController>(AdmissionController);
  });

  it('getAdmissionInformation', () => {
    expect(admissionController.getAdmissionInfo(req)).not.toEqual(null);
  });
  it('getAdmissionInformation', () => {
    admissionController.getAdmissionInfo(req);
    expect(admissionService.getAdmissionInformation).toHaveBeenCalled();
  });
});
