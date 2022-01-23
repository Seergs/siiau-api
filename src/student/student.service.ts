import { Injectable, Logger } from '@nestjs/common';
import { StudentInfoInteractor } from './interactors/student-info-interactor';
import { StudentProgressInteractor } from './interactors/student-progress-interactor';
import { AuthService } from 'src/auth/auth.service';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { DiscordService } from 'src/discord/discord.service';

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name);

  constructor(private readonly authService: AuthService, private readonly analyticsService: AnalyticsService, private readonly discordService: DiscordService) {}

  async getStudent(studentCode: string, studentNip: string, url: string, paramsRequested: string[]) {
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('student', url);
    this.discordService.sendMessage("Hey! a request was made to " + this.getStudent.name)
    try {
      const studentInfo = await StudentInfoInteractor.getStudentInfo(
        page,
        paramsRequested,
      );
      await page.close();
      this.logger.log('Done getting student information');
      return studentInfo;
    } catch (e) {
      this.logger.error(e);
      return 'Something went wrong getting the student information';
    }
  }

  async getAcademicProgress(studentCode: string, studentNip: string, url: string) {
    const page = await this.authService.login(studentCode, studentNip);
    this.analyticsService.save('student', url);
    this.discordService.sendMessage("Hey! a request was made to " + this.getAcademicProgress.name)
    try {
      const studentProgress =
        await StudentProgressInteractor.getAcademicProgress(page);
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
