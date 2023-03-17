import { Controller, Get, Logger, Req } from '@nestjs/common';
import { ApiHeaders, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CreditsService } from './credits.service';
import { RootResponse, RootHeaders } from './swagger';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  private readonly logger = new Logger('CreditsController');
  constructor(private readonly creditsService: CreditsService) {}

  @ApiResponse(RootResponse)
  @ApiHeaders(RootHeaders)
  @Get()
  async getCredits(@Req() request: Request) {
    const response = await this.creditsService.getCredits(request);
    this.logger.debug({ data: response }, 'Response');
    return response;
  }
}
