import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from 'src/auth/auth.service';
import { CacheClient } from 'src/cache/cache.client';
import { AdmissionService } from '../admission.service';
import fetch from 'node-fetch';
jest.mock('node-fetch');

const html = `<body>
<div></div>
<div></div>
<div></div>
<div>
<div></div>
<div></div>
<div>
<TABLE>
<TR>
<TH>Ciclo</TH>
<TH>Escuela de procedencia</TH>
<TH>Tipo de admisi&oacute;n</TH>
<TH>PEP</TH>
<TH>PAA</TH>
<TH>PA</TH>
<TH>AV</TH>
<TH>Carrera</TH>
</TR>
<TR>
<TD>VALUE1</TD>
<TD>VALUE2</TD>
<TD>VALUE3</TD>
<TD>VALUE4</TD>
<TD>VALUE5</TD>
<TD>VALUE6</TD>
<TD>VALUE7</TD>
<TD>VALUE8</TD>
</TR>
</TABLE></div></div></body>`;

class MockAuthService {
  async getSession() {
    return {
      cookie: 'cookie',
      studentCode: 'studentCode',
      pidm: 'pidm',
    };
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
    const AuthServiceProvider = {
      provide: AuthService,
      useClass: MockAuthService,
    };
    const CacheProvider = {
      provide: CacheClient,
      useClass: MockCacheClient,
    };
    const module = await Test.createTestingModule({
      providers: [AdmissionService, AuthServiceProvider, CacheProvider],
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
      const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockedFetch.mockResolvedValue({
        text: () => Promise.resolve(html),
      } as any);
      const result = await admissionService.getAdmissionInfoV1(request as any);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);
      expect(result[0].calendar).toEqual('VALUE1');
      expect(result[0].schoolOfOrigin).toEqual('VALUE2');
    });

    it('should throws error when something fails', async () => {
      const request = {
        headers: {
          'x-student-code': '217758497',
          'x-student-nip': '123456',
        },
      };
      const AuthServiceProvider = {
        provide: AuthService,
        useClass: MockAuthService,
      };
      const CacheProvider = {
        provide: CacheClient,
        useClass: MockCacheClient,
      };
      const module = await Test.createTestingModule({
        providers: [AdmissionService, AuthServiceProvider, CacheProvider],
      }).compile();

      admissionService = module.get<AdmissionService>(AdmissionService);
      const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
      mockedFetch.mockResolvedValue({
        text: () => Promise.reject('Some error'),
      } as any);

      try {
        await admissionService.getAdmissionInfoV1(request as any);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
      }
    });
  });
});
