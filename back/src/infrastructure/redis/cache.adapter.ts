import { CachePort } from '@/application/ports/cache.port';
import { redisClient } from '@/infrastructure/redis/client';

export class RedisCacheAdapter implements CachePort {
  async get(key: string): Promise<string | null> {
    return redisClient.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await redisClient.setEx(key, ttlSeconds, value);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}
