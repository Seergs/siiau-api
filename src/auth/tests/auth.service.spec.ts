import { Test } from '@nestjs/testing';
import constants from 'src/constants';
import { PuppeteerModule } from 'src/puppeteer/puppeteer.module';
import { PuppeteerService } from 'src/puppeteer/puppeteer.service';
import { AuthService } from '../auth.service';

class PuppeteerMock {
  setUpInitialPage(_: string) {
    return pageValid;
  }
}

const pageValid = {
  waitForTimeout: (_: number) => {},
  frames: () => [firstScreenFrame, validContentFrame],
};

const pageInvalid = {
  waitForTimeout: (_: number) => {},
  frames: () => [firstScreenFrame, invalidContentFrame],
};

const firstScreenFrame = {
  name: () => 'mainFrame',
  type: () => {},
  click: () => {},
};
const validContentFrame = {
  name: () => 'Contenido',
  type: () => {},
  click: () => {},
  content: () => constants.selectors.home.validator,
};

const invalidContentFrame = {
  name: () => 'Contenido',
  type: () => {},
  click: () => {},
  content: () => '',
};

describe.only('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService],
      imports: [PuppeteerModule],
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
    let studentCode: string;
    let studentNip: string;
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
