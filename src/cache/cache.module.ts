import { Module } from '@nestjs/common';
import { CacheClient } from './cache.client';

@Module({
  providers: [CacheClient],
  exports: [CacheClient],
})
export class CacheModule {}
