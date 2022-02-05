import { Injectable, Logger } from '@nestjs/common';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';
import { AuthService } from 'src/auth/auth.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { DiscordService } from 'src/discord/discord.service';
import { Request } from 'express';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly analyticsService: AnalyticsService,
    private readonly discordService: DiscordService,
  ) {}

  async getStudent(
    request: Request,
    paramsRequested: string[],
    selectedCareer: string,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('student', request.url);
    if (this.discordService.shouldSendDiscordMessage(request)) {
      this.discordService.sendMessage(
        'Hey! a request was made to ' + this.getStudent.name,
      );
    }
    try {
      const studentInfo = await StudentInfoInteractor.getStudentInfo(
        page,
        paramsRequested,
        selectedCareer,
      );
      await page.close();
      this.logger.log('Done getting student information');
      return studentInfo;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }

  async getAcademicProgress(request: Request, selectedCareer) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('student', request.url);
    if (this.discordService.shouldSendDiscordMessage(request)) {
      this.discordService.sendMessage(
        'Hey! a request was made to ' + this.getAcademicProgress.name,
      );
    }
    try {
      const studentProgress =
        await StudentProgressInteractor.getAcademicProgress(
          page,
          selectedCareer,
        );
      await page.close();
      return studentProgress;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student progress';
    }
  }

  async login(studentCode: string, studentNip: string) {
    await this.authService.login(studentCode, studentNip);
  }
}
