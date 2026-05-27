import IORedis from 'ioredis';

let redis: IORedis | null = null;
let isDemo = false;

export async function connectRedis(): Promise<void> {
  const url = process.env.REDIS_URL;

  if (!url || url === 'demo') {
    isDemo = true;
    console.log('✅ Redis (in-memory) — demo mode');
    return;
  }

  redis = new IORedis(url, { maxRetriesPerRequest: null, lazyConnect: true });
  redis.on('connect', () => console.log('✅ Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err));
  await redis.connect();
}

export function getRedis(): IORedis {
  if (isDemo || !redis) throw new Error('DEMO_MODE');
  return redis;
}

export function isDemoMode(): boolean {
  return isDemo;
}
