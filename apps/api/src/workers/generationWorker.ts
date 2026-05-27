import { createWorker } from '../services/queue';
import { AssignmentModel } from '../models/Assignment';
import { generatePaper } from '../services/aiService';
import { broadcastToAssignment } from '../socket/wsServer';
import type { AssignmentInput } from '@vedaai/shared';

export interface GenerationJobData {
  assignmentId: string;
  input: AssignmentInput;
}

export async function startWorker(): Promise<void> {
  await createWorker(
    // handler
    async (job) => {
      const { assignmentId, input } = job.data as GenerationJobData;
      console.log(`🔄 Processing job ${job.id} for assignment ${assignmentId}`);

      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'processing' });
      broadcastToAssignment({ type: 'job:processing', assignmentId });

      const paper = await generatePaper(assignmentId, input);

      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'completed', paper });
      broadcastToAssignment({ type: 'job:completed', assignmentId, data: paper });

      console.log(`✅ Completed job ${job.id}`);
      return paper;
    },
    // onFailed
    async (job, err) => {
      const { assignmentId } = job.data as GenerationJobData;
      console.error(`❌ Job ${job.id} failed:`, err.message);
      await AssignmentModel.findByIdAndUpdate(assignmentId, { status: 'failed', error: err.message });
      broadcastToAssignment({ type: 'job:failed', assignmentId, data: { error: err.message } });
    }
  );
}
