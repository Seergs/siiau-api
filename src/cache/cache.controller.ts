import {
  Controller,
  Get,
  Logger,
  Param,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { CacheClient } from './cache.client';

@Controller({
  path: 'cache',
  version: VERSION_NEUTRAL,
})
export class CacheController {
  private readonly logger = new Logger(CacheController.name);
  constructor(private readonly cache: CacheClient) {}

  @Get('refresh')
  async refreshCache() {
    this.logger.log('Refreshing cache');
    await this.cache.refresh();
  }

  @Get('refresh/:key')
  async refreshCacheKey(@Param('key') key: string) {
    this.logger.log(`Refreshing cache key ${key}`);
    await this.cache.delete(key);
  }
}
