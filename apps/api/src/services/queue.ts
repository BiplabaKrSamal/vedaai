import { Queue } from 'bullmq';
import { getRedis } from '../services/redis';

export const QUEUE_NAME = 'paper-generation';

let generationQueue: Queue;

export function getQueue(): Queue {
  if (!generationQueue) {
    generationQueue = new Queue(QUEUE_NAME, {
      connection: getRedis(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
  }
  return generationQueue;
}
