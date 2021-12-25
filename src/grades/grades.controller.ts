import { Controller, Get, Query, Res } from '@nestjs/common';
import {Response} from 'express';
import {Page} from 'puppeteer';
import {GradesService} from './grades.service';

@Controller('grades')
export class GradesController {

constructor(private readonly gradesService: GradesService) {}

 @Get()
  getGrades(@Query() query: Record<string, any>, @Res({passthrough: true}) response: Response) {
    const puppeteerPage = response.locals.page as Page;
    const semester = query['semester'];
    return this.gradesService.getGrades(puppeteerPage, semester);
  }
}
