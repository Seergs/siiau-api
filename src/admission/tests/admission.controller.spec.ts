import { Test } from '@nestjs/testing';
import { AdmissionController } from '../admission.controller';
import { AdmissionService } from '../admission.service';

class AdmissionServiceMock {
  getAdmissionInformation() {
    return 'Admission information';
  }
}

describe('AdmissionController', () => {
  let admissionController: AdmissionController;
  beforeAll(async () => {
    const ApiServiceProvider = {
      provide: AdmissionService,
      useClass: AdmissionServiceMock,
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AdmissionController],
      providers: [ApiServiceProvider],
    }).compile();
    admissionController =
      moduleRef.get<AdmissionController>(AdmissionController);
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
