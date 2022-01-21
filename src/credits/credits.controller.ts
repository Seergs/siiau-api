import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';
import { CreditsService } from './credits.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(
    private readonly creditsService: CreditsService,
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService
  ) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getCredits(
    @Req() request: Request,
  ) {
    const studentCode = request.headers['x-student-code'] as string;
    const studentNip = request.headers['x-student-nip'] as string;
    const page = await this.authService.login(studentCode, studentNip);
    this.databaseService.save('credits', request.url);
    return this.creditsService.getCredits(page);
  }
}
