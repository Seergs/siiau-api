import { Injectable } from '@nestjs/common';
import { RedisClientType } from '@redis/client';
import { createClient } from 'redis';

@Injectable()
export class CacheClient {
  client: RedisClientType;

  constructor() {
    const connectionString = process.env.REDIS_URL;
    this.client = createClient({ url: connectionString });
    this.client.on('error', function (error) {
      console.error(error);
    });
    this.connect();
  }

  async connect() {
    await this.client.connect();
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: any) {
    await this.client.set(key, value, {
      EX: 60 * 60 * 24 * 7, // 1 week
    });
  }

  async delete(key: string) {
    await this.client.del(key);
  }
}
