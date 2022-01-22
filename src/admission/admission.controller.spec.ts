import { Test } from '@nestjs/testing';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { AdmissionController } from './admission.controller';
import { AdmissionService } from './admission.service';
import { DatabaseService } from '../database/database.service';

const authService = {
  login: (_: string, __: string) => {
    return;
  },
};

const dbService = {
  save: () => {},
};

describe('AdmissionController', () => {
  let admissionController: AdmissionController;
  let admissionService: AdmissionService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdmissionController],
      providers: [AdmissionService],
      imports: [DatabaseModule, PuppeteerModule, AuthModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .overrideProvider(DatabaseService)
      .useValue(dbService)
      .compile();

    admissionService = moduleRef.get<AdmissionService>(AdmissionService);
    admissionController =
      moduleRef.get<AdmissionController>(AdmissionController);
  });

  describe('getAdmissionInformation', () => {
    it('Should return an array of Amission', async () => {
      const result = [
        {
          calendar: '2017-B',
          schoolOfOrigin: '',
          admissionType: 'PRIMER INGRESO',
          gpaSchoolOfOrigin: '82',
          admissionTestScore: '81.2222',
          admissionScore: '163.2222',
          personalContribution: '0',
          career: 'INGENIERIA EN COMPUTACION',
        },
      ] as any;
      const req: any = {
        headers: {
          'x-student-code': '2177584987',
          'x-student-nip': 'password',
        },
      };
      jest
        .spyOn(admissionService, 'getAdmissionInformation')
        .mockImplementation(() => result);
      expect(await admissionController.getAdmissionInfo(req)).toBe(result);
    });
  });
});
