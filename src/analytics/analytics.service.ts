import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Analytic as AnalyticModel } from 'src/model/analytic.model';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    @InjectModel(AnalyticModel) private Analytic: typeof AnalyticModel,
  ) {}

  async save(controller: string, path: string) {
    try {
      await this.Analytic.create({
        controller,
        path,
      });
      this.logger.debug('analytics saved');
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong: ' + e);
    }
  }

  async getAll() {
    try {
      return await this.Analytic.findAll();
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong: ' + e);
    }
  }

  async getSummary() {
    const results = {};
    try {
      const analytics = await this.getAll();
      for (const row of analytics) {
        const removedQueryParamsPath = row.path.substring(
          0,
          row.path.indexOf('?'),
        );
        let key: string;
        if (removedQueryParamsPath === '') {
          key = row.path;
        } else {
          key = removedQueryParamsPath;
        }
        if (!results[key]) {
          results[key] = 1;
        } else {
          results[key] += 1;
        }
      }
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong: ' + e);
    }
    return results;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async ping() {
    try {
      const count = await this.Analytic.count();
      this.logger.debug('Queried database = ' + count);
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong' + e);
    }
  }
}
