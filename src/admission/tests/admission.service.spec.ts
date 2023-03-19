import { Test } from '@nestjs/testing';
import { AlertService } from 'src/alerts/alerts.service';
import { AuthService } from 'src/auth/auth.service';
import { CacheClient } from 'src/cache/cache.client';
import { AdmissionService } from '../admission.service';
import { Admission } from '../entities/admission.entity';
import { AdmissionInteractor } from '../interactors/admission.interactor';

class MockAlertService {
  sendErrorAlert() {
    return Promise.resolve();
  }
}
class MockAuthService {
  login() {
    const page = {
      isClosed() {
        return false;
      },
      close() {
        return Promise.resolve();
      },
    };
    return Promise.resolve(page);
  }
}
class MockInteractor {
  getAdmissionInformation() {
    const admission = new Admission();
    admission.career = 'Ingeniería en Computación';
    const admissions = [admission];
    return Promise.resolve(admissions);
  }
}

class MockInteractorError {
  getAdmissionInformation() {
    return Promise.reject(new Error('Error'));
  }
}

class MockCacheClient {
  get() {
    return Promise.resolve(null);
  }
  set() {
    return Promise.resolve();
  }
}

describe('AdmissionService', () => {
  let admissionService: AdmissionService;

  beforeEach(async () => {
    const AlertServiceProvider = {
      provide: AlertService,
      useClass: MockAlertService,
    };
    const AuthServiceProvider = {
      provide: AuthService,
      useClass: MockAuthService,
    };
    const InteractorProvider = {
      provide: AdmissionInteractor,
      useClass: MockInteractor,
    };
    const CacheProvider = {
      provide: CacheClient,
      useClass: MockCacheClient,
    };
    const module = await Test.createTestingModule({
      providers: [
        AdmissionService,
        AlertServiceProvider,
        AuthServiceProvider,
        InteractorProvider,
        CacheProvider,
      ],
    }).compile();

    admissionService = module.get<AdmissionService>(AdmissionService);
  });

  it('should be defined', () => {
    expect(admissionService).toBeDefined();
  });

  describe('getAdmissionInformation', () => {
    it('should return an array of admission information', async () => {
      const request = {
        headers: {
          'x-student-code': '217758497',
          'x-student-nip': '123456',
        },
      };
      const result = await admissionService.getAdmissionInformation(
        request as any,
      );
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect((result[0] as Admission).career).toEqual(
        'Ingeniería en Computación',
      );
    });

    it('should return error when something fails', async () => {
      const request = {
        headers: {
          'x-student-code': '217758497',
          'x-student-nip': '123456',
        },
      };
      const AlertServiceProvider = {
        provide: AlertService,
        useClass: MockAlertService,
      };
      const AuthServiceProvider = {
        provide: AuthService,
        useClass: MockAuthService,
      };
      const InteractorProvider = {
        provide: AdmissionInteractor,
        useClass: MockInteractorError,
      };
      const CacheProvider = {
        provide: CacheClient,
        useClass: MockCacheClient,
      };
      const module = await Test.createTestingModule({
        providers: [
          AdmissionService,
          AlertServiceProvider,
          AuthServiceProvider,
          InteractorProvider,
          CacheProvider,
        ],
      }).compile();

      admissionService = module.get<AdmissionService>(AdmissionService);

      const result = await admissionService.getAdmissionInformation(
        request as any,
      );
      expect(result).toEqual(
        'Something went wrong getting the student admission information',
      );
    });
  });
});
