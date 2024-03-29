import { Test } from '@nestjs/testing';
import constants from 'src/constants';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { AuthService } from '../auth.service';
import { AlertsModule } from 'src/alerts/alerts.module';

class PuppeteerMock {
  setUpInitialPage() {
    return pageValid;
  }
}

const pageValid = {
  waitForTimeout: jest.fn(),
  frames: () => [firstScreenFrame, validContentFrame],
};

const firstScreenFrame = {
  name: () => 'mainFrame',
  type: jest.fn(),
  click: jest.fn(),
};
const validContentFrame = {
  name: () => 'Contenido',
  type: jest.fn(),
  click: jest.fn(),
  content: () => constants.selectors.home.validator,
};

describe.only('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
      imports: [PuppeteerModule, AlertsModule],
    })
      .overrideProvider(PuppeteerService)
      .useClass(PuppeteerMock)
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  it('should call login with expected params', async () => {
    const loginSpy = jest.spyOn(authService, 'login');
    const studentCode = 'mycode';
    const studentNip = 'mynip';
    authService.login(studentCode, studentNip);
    expect(loginSpy).toHaveBeenCalledWith(studentCode, studentNip);
  });

  it('should fail if no studentCode or studentNip', async () => {
    let studentCode: string = undefined;
    let studentNip: string = undefined;
    try {
      await authService.login(studentCode, studentNip);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Missing auth headers');
    }

    studentCode = '';
    studentNip = '';
    try {
      await authService.login(studentCode, studentNip);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Missing auth headers');
    }
  });

  it('should fail studentNip longer that 10 chars', async () => {
    const studentNip = 'verylongprotectedpassword';
    try {
      await authService.login('studentCode', studentNip);
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Nip cannot be longer than 10 characters');
    }
  });
});
