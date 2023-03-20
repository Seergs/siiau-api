import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AuthService, Session } from 'src/auth/auth.service';
import { Request } from 'express';
import { CacheClient } from 'src/cache/cache.client';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';
import fetch from 'node-fetch';
import { StudentParser } from './student.parser';
import constants from 'src/constants';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);
  private readonly cacheSuffix = 'student';

  constructor(
    private readonly authService: AuthService,
    private readonly cache: CacheClient,
  ) {}

  async getStudent(request: Request, params: string[], career: string) {
    const session = await this.authService.getSession(request);
    this.logger.debug('Successfully logged in');
    try {
      const cacheKey = this.getCacheKey(session, career);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        const preResponse = JSON.parse(cached);
        this.filterUnrequestedParams(preResponse, params);
        return preResponse;
      }

      this.logger.debug('Returning fresh data');
      const careerData = await this.getCareerParams(session);
      this.logger.debug(careerData, 'Got double career params');
      const data = await this.getStudentInfo(
        session,
        careerData.major,
        careerData.admissionCycle,
      );
      await this.cache.set(cacheKey, JSON.stringify(data));
      this.filterUnrequestedParams(data, params);
      return data;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Something went wrong getting the student information',
      );
    }
  }

  getCacheKey(session: Session, career: string) {
    const careerCacheKey = career ? career : 'any';
    return `${session.studentCode}-${this.cacheSuffix}-${careerCacheKey}`;
  }

  async getAcademicProgress(request: Request, selectedCareer: string) {
    const session = await this.authService.getSession(request);
    this.logger.debug('Successfully logged in');

    try {
      const careerCacheKey = selectedCareer ? selectedCareer : 'any';
      const cacheKey = `${session.studentCode}-${this.cacheSuffix}-progress-${careerCacheKey}`;
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        this.logger.debug('Returning cached data');
        return JSON.parse(cached);
      }

      this.logger.debug('Returning fresh data');
      const careerData = await this.getCareerParams(session);
      this.logger.debug(careerData, 'Got double career params');
      const data = await this.getStudentProgress(
        session,
        careerData.major,
        careerData.admissionCycle,
      );
      await this.cache.set(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      this.logger.error(e);
      throw new InternalServerErrorException(
        'Something went wrong getting the student progress',
      );
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

  async login(req: Request) {
    await this.authService.getSession(req);
  }

  async getCareerParams(session: Session) {
    try {
      const response = await fetch(constants.urls.careerParams, {
        method: 'POST',
        headers: {
          Cookie: session.cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `pForma=SGPHIST.FICHA_DC&pParametroPidmAlumno=pidmp&pPidmAlumno=${session.pidm}&pParametroCarrera=majrP&pParametroCicloAdmision=cicloaP`,
      });
      return new StudentParser().parseCareerParams(await response.text());
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getStudentInfo(
    session: Session,
    career: string,
    admissionCycle: string,
  ) {
    try {
      const response = await fetch(constants.urls.student, {
        method: 'POST',
        headers: {
          Cookie: session.cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `pidmp=${session.pidm}&majrP=${career}&cicloaP=${admissionCycle}`,
      });
      return new StudentParser().parse(await response.text());
    } catch (e) {
      this.logger.error(e);
    }
  }

  async getStudentProgress(session: Session, career: string, cycle: string) {
    try {
      const response = await fetch(constants.urls.student, {
        method: 'POST',
        headers: {
          Cookie: session.cookie,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `pidmp=${session.pidm}&majrP=${career}&cicloaP=${cycle}`,
      });
      return new StudentParser().parseProgress(await response.text());
    } catch (e) {
      this.logger.error(e);
    }
  }
}
