import { Test } from '@nestjs/testing';
import { AdmissionControllerV1 } from '../admission.controller.v1';
import { AdmissionService } from '../admission.service';

class AdmissionServiceMock {
  getAdmissionInfoV1() {
    return 'Admission information';
  }
}

describe('AdmissionController', () => {
  let admissionController: AdmissionControllerV1;
  beforeAll(async () => {
    const ApiServiceProvider = {
      provide: AdmissionService,
      useClass: AdmissionServiceMock,
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdmissionControllerV1],
      providers: [ApiServiceProvider],
    }).compile();
    admissionController = moduleRef.get<AdmissionControllerV1>(
      AdmissionControllerV1,
    );
  });

  it('should be defined', () => {
    expect(admissionController).toBeDefined();
  });

  describe('getAdmissionInformation', () => {
    it('should return admission information', async () => {
      const result = await admissionController.getAdmissionInfo({} as any);
      expect(result).toEqual('Admission information');
    });
  });
});
