import { Module } from '@nestjs/common';
import { CacheClient } from './cache.client';
import { CacheController } from './cache.controller';

@Module({
  providers: [CacheClient],
  exports: [CacheClient],
  controllers: [CacheController],
})
export class CacheModule {}
