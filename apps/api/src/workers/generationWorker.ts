import { Worker, Job } from 'bullmq';
import { QUEUE_NAME } from '../services/queue';
import { getRedis } from '../services/redis';
import { AssignmentModel } from '../models/Assignment';
import { generatePaper } from '../services/aiService';
import { broadcastToAssignment } from '../socket/wsServer';
import type { AssignmentInput } from '@vedaai/shared';

export interface GenerationJobData {
  assignmentId: string;
  input: AssignmentInput;
}

export function startWorker(): void {
  const worker = new Worker<GenerationJobData>(
    QUEUE_NAME,
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, input } = job.data;
      console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

      // Update status → processing
      await AssignmentModel.findByIdAndUpdate(assignmentId, {
        status: 'processing',
      });

      broadcastToAssignment({
        type: 'job:processing',
        assignmentId,
      });

      // Generate paper via AI
      const paper = await generatePaper(assignmentId, input);

      // Store result
      await AssignmentModel.findByIdAndUpdate(assignmentId, {
        status: 'completed',
        paper,
      });

      // Notify frontend
      broadcastToAssignment({
        type: 'job:completed',
        assignmentId,
        data: paper,
      });

      console.log(`✅ Completed job ${job.id} for assignment ${assignmentId}`);
      return paper;
    },
    {
      connection: getRedis(),
      concurrency: 3,
    }
  );

  worker.on('failed', async (job, err) => {
    if (!job) return;
    const { assignmentId } = job.data;
    console.error(`❌ Job ${job.id} failed:`, err.message);

    await AssignmentModel.findByIdAndUpdate(assignmentId, {
      status: 'failed',
      error: err.message,
    });

    broadcastToAssignment({
      type: 'job:failed',
      assignmentId,
      data: { error: err.message },
    });
  });

  console.log('⚙️  BullMQ worker started');
}
