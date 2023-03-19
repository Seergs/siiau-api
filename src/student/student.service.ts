import { Injectable, Logger } from '@nestjs/common';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { AlertService } from 'src/alerts/alerts.service';
import { CacheClient } from 'src/cache/cache.client';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  private readonly cacheSuffix = 'student';

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
    private readonly cache: CacheClient,
  ) {}

  async getStudent(
    request: Request,
    paramsRequested: string[],
    selectedCareer: string,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    const careerCacheKey = selectedCareer ? selectedCareer : 'any';
    const cacheKey = `${studentCode}-${this.cacheSuffix}-${careerCacheKey}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached data');
      const data = JSON.parse(cached);
      this.filterUnrequestedParams(data, paramsRequested);
      return data;
    }

    try {
      this.logger.debug('Returning fresh data');
      const interactor = new StudentInfoInteractor(this.alerts);
      const data = await interactor.getStudentInfo(page, selectedCareer);
      await this.cache.set(cacheKey, JSON.stringify(data));
      this.filterUnrequestedParams(data, paramsRequested);
      return data;
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student information';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  async getAcademicProgress(request: Request, selectedCareer: string) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    const careerCacheKey = selectedCareer ? selectedCareer : 'any';
    const cacheKey = `${studentCode}-${this.cacheSuffix}-progress-${careerCacheKey}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug('Returning cached data');
      return JSON.parse(cached);
    }
    try {
      this.logger.debug('Returning fresh data');
      const interactor = new StudentProgressInteractor(this.alerts);
      const data = await interactor.getAcademicProgress(page, selectedCareer);
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      await this.alerts.sendErrorAlert(page, e);
      return 'Something went wrong getting the student progress';
    } finally {
      if (!page.isClosed()) {
        await page.close();
      }
    }
  }

  private filterUnrequestedParams(
    preResponse: StudentInfo,
    paramsRequested: string[],
  ) {
    const totalParams = studentInfoKeys;
    const unrequestedParams = totalParams.filter(
      (p) => !paramsRequested.includes(p),
    );
    for (const unrequestedParam of unrequestedParams) {
      delete preResponse[unrequestedParam];
    }
  }

  async login(studentCode: string, studentNip: string) {
    await this.authService.login(studentCode, studentNip);
  }
}
