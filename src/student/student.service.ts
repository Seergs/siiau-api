import { Injectable, Logger } from '@nestjs/common';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';
import { AuthService } from 'src/auth/auth.service';
import { Request } from 'express';
import { AlertService } from 'src/alerts/alerts.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly alerts: AlertService,
  ) {}

  async getStudent(
    request: Request,
    paramsRequested: string[],
    selectedCareer: string,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    try {
      const interactor = new StudentInfoInteractor(this.alerts);
      return await interactor.getStudentInfo(
        page,
        paramsRequested,
        selectedCareer,
      );
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
    try {
      const interactor = new StudentProgressInteractor(this.alerts);
      return await interactor.getAcademicProgress(page, selectedCareer);
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

  async login(studentCode: string, studentNip: string) {
    await this.authService.login(studentCode, studentNip);
  }
}
