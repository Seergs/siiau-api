import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
  version: VERSION_NEUTRAL,
  path: 'health',
})
export class HealthController {
  @Get()
  checkHealth() {
    return 'ok';
  }
}
