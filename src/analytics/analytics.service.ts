import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as mysql from 'mysql2/promise';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private db: mysql.Connection;
  constructor() {
    this.initializeConnection();
  }

  async initializeConnection() {
    this.db = await mysql.createConnection({
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    await this.db.connect();
  }

  async save(controller: string, path: string) {
    const query = `INSERT INTO analytics(controller, path, date) VALUES('{1}','{2}', NOW())`;
    const statement = query.replace('{1}', controller).replace('{2}', path);
    try {
      await this.db.execute(statement);
      this.logger.debug('analytics saved');
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getAll() {
    const query = 'SELECT * from analytics';
    try {
      const [rows] = await this.db.execute(query);
      return rows;
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getSummary() {
    const results = {};
    const query = 'SELECT * from analytics';
    try {
      const [rows] = await this.db.execute(query);
      for (const row of rows as mysql.RowDataPacket[]) {
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
      throw new InternalServerErrorException('Something went wrong');
    }
    return results;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async ping() {
    const query = 'SELECT count(*) from analytics';
    try {
      this.logger.debug('Pinging database: ' + query);
      await this.db.execute(query);
    } catch (e) {
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
