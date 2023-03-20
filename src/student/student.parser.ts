import { Logger } from '@nestjs/common';
import cheerio from 'cheerio';
import constants from 'src/constants';
import { StudentInfo, studentInfoKeys } from './entities/student-info-entity';
import {
  StudentProgress,
  StudentProgressResponse,
  StudentProgressTotal,
} from './entities/student-progress-entity';

export class StudentParser {
  private readonly logger = new Logger(StudentParser.name);
  parseCareerParams(html: string) {
    const $ = cheerio.load(html);
    const major = $('input[name="majrP"]').val() as string;
    const admissionCycle = $('input[name="cicloaP"]').val() as string;
    return {
      major,
      admissionCycle,
    };
  }

  parse(html: string) {
    const $ = cheerio.load(html);
    const student = new StudentInfo();
    const totalParams = studentInfoKeys;

    for (const param of totalParams) {
      const value = $(constants.selectors.studentInfo.v1[param]).text();
      student[param] = value;
    }
    return student;
  }

  parseProgress(html: string) {
    const $ = cheerio.load(html);
    const table = $(constants.selectors.studentProgress.v1.table);
    const rows = table.find('tr');
    const progressRows = rows.slice(2, rows.length - 1);
    let progress: StudentProgressResponse;
    const progressArray: StudentProgress[] = [];
    progressRows.each((index, row) => {
      const columns = $(row).find('td');
      const progress: StudentProgress = {
        calendar: columns.eq(0).text(),
        admission: columns.eq(1).text(),
        career: columns.eq(2).text(),
        campus: columns.eq(3).text(),
        campusAlt: columns.eq(4).text(),
        gpa: columns.eq(5).text(),
        credits: columns.eq(6).text(),
        percentage: columns.eq(7).text().trim(),
      };
      progressArray.push(progress);
    });
    const totalRow = rows.eq(rows.length - 1);
    const totalColumns = totalRow.find('th');
    const total = {
      gpa: totalColumns.eq(5).text(),
      credits: totalColumns.eq(6).text(),
      percentage: totalColumns.eq(7).text().trim(),
    };

    return new StudentProgressResponse({
      semesters: progressArray,
      total: total,
    });
  }
}
