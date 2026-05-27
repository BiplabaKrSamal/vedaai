import { isDemoMode } from './redis';

// ─── In-memory job queue for demo mode ────────────────────────────────────────
type JobHandler = (data: unknown) => Promise<unknown>;
const handlers: JobHandler[] = [];
let jobCounter = 0;

export interface InMemoryJob {
  id: string;
  data: unknown;
}

class InMemoryQueue {
  async add(_name: string, data: unknown): Promise<{ id: string }> {
    const id = `demo-job-${++jobCounter}`;
    // Run asynchronously so the HTTP response returns immediately
    setImmediate(async () => {
      for (const handler of handlers) {
        try {
          await handler(data);
        } catch (err) {
          console.error('[InMemoryQueue] job failed:', err);
        }
      }
    });
    return { id };
  }
}

class InMemoryWorker {
  constructor(_name: string, handler: JobHandler) {
    handlers.push(handler);
    console.log('⚙️  In-memory worker started — demo mode');
  }
  on(_event: string, _cb: unknown) { return this; }
}

// ─── BullMQ wrappers (real Redis) ─────────────────────────────────────────────
let _queue: import('bullmq').Queue | InMemoryQueue | null = null;

export const QUEUE_NAME = 'paper-generation';

export async function getQueue(): Promise<import('bullmq').Queue | InMemoryQueue> {
  if (_queue) return _queue;

  if (isDemoMode()) {
    _queue = new InMemoryQueue();
    return _queue;
  }

  const { Queue } = await import('bullmq');
  const { getRedis } = await import('./redis');
  _queue = new Queue(QUEUE_NAME, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    },
  });
  return _queue;
}

export async function createWorker(
  handler: (job: { id: string; data: unknown }) => Promise<unknown>,
  onFailed: (job: { id: string; data: unknown }, err: Error) => Promise<void>
): Promise<void> {
  if (isDemoMode()) {
    new InMemoryWorker(QUEUE_NAME, async (data) => {
      const job = { id: `demo-${Date.now()}`, data };
      try {
        await handler(job);
      } catch (err) {
        await onFailed(job, err as Error);
      }
    });
    return;
  }

  const { Worker } = await import('bullmq');
  const { getRedis } = await import('./redis');
  const worker = new Worker(
    QUEUE_NAME,
    async (job) => handler({ id: job.id ?? "unknown", data: job.data }),
    { connection: getRedis(), concurrency: 3 }
  );
  worker.on('failed', async (job, err) => {
    if (job) await onFailed({ id: job.id ?? "unknown", data: job.data }, err);
  });
  console.log('⚙️  BullMQ worker started');
}
