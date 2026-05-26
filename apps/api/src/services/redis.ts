import IORedis from 'ioredis';

let redis: IORedis;

export async function connectRedis(): Promise<IORedis> {
  redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
  });

  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));

  return redis;
}

export function getRedis(): IORedis {
  if (!redis) throw new Error('Redis not initialized');
  return redis;
}

export { redis };
