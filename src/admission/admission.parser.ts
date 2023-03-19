import { Admission } from './entities/admission.entity';
import cheerio from 'cheerio';
import { Logger } from '@nestjs/common';
import constants from 'src/constants';

export class AdmissionParser {
  private readonly logger = new Logger(AdmissionParser.name);

  private readonly html: string;

  constructor(html: string) {
    this.html = html;
  }

  parse(): Admission[] {
    const parsed = cheerio.load(this.html);
    const table = parsed(constants.selectors.admission.v1.table);
    this.logger.debug(`Table: ${table.html()}`);
    const rows = table.find('tr');

    //Exclude header row
    const admissionRows = rows.slice(1);
    const admissions: Admission[] = [];
    admissionRows.each((_, row) => {
      const columns = parsed(row).find('td');
      const admission: Admission = {
        calendar: columns.eq(0).text(),
        schoolOfOrigin: columns.eq(1).text(),
        admissionType: columns.eq(2).text(),
        gpaSchoolOfOrigin: columns.eq(3).text(),
        admissionTestScore: columns.eq(4).text(),
        admissionScore: columns.eq(5).text(),
        personalContribution: columns.eq(6).text(),
        career: columns.eq(7).text(),
      };
      this.logger.debug({ data: admission }, 'Admission');
      admissions.push(admission);
    });
    return admissions;
  }
}
