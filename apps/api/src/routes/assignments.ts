import { Router, Request, Response } from 'express';
import type { IRouter } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { AssignmentModel } from '../models/Assignment';
import { getQueue } from '../services/queue';
import { broadcastToAssignment } from '../socket/wsServer';
import type { ApiResponse } from '@vedaai/shared';

export const assignmentRouter: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

const QuestionTypeSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks']),
  count: z.number({ coerce: true }).int().min(1).max(50),
  marksPerQuestion: z.number({ coerce: true }).min(0.5).max(100),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  grade: z.string().min(1).max(50),
  dueDate: z.string().min(1),
  questionTypes: z.array(QuestionTypeSchema).min(1),
  totalMarks: z.number({ coerce: true }).min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  additionalInstructions: z.string().optional(),
  materialText: z.string().optional(),
  materialFileName: z.string().optional(),
});

// POST /api/assignments
assignmentRouter.post('/', upload.single('material'), async (req: Request, res: Response) => {
  try {
    let body = req.body;
    if (typeof body.data === 'string') body = JSON.parse(body.data);

    if (req.file) {
      if (req.file.mimetype === 'text/plain') {
        body.materialText = req.file.buffer.toString('utf-8');
      }
      body.materialFileName = req.file.originalname;
    }

    if (typeof body.questionTypes === 'string') body.questionTypes = JSON.parse(body.questionTypes);

    const parsed = CreateAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Validation failed', data: parsed.error.flatten() });
      return;
    }

    const input = parsed.data;
    const assignment = await AssignmentModel.create({ input, status: 'pending' });
    const queue = await getQueue();
    const job = await queue.add('generate', { assignmentId: assignment._id.toString(), input });
    await assignment.updateOne({ jobId: job.id });

    broadcastToAssignment({ type: 'job:queued', assignmentId: assignment._id.toString() });

    res.status(201).json({
      success: true,
      data: { _id: assignment._id, status: 'pending', jobId: job.id },
      message: 'Assignment created and queued for generation',
    } satisfies ApiResponse);
  } catch (err) {
    console.error('POST /assignments:', err);
    res.status(500).json({ success: false, error: err instanceof Error ? err.message : 'Internal error' });
  }
});

// GET /api/assignments
assignmentRouter.get('/', async (_req, res) => {
  const assignments = await AssignmentModel.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: assignments });
});

// GET /api/assignments/:id
assignmentRouter.get('/:id', async (req, res) => {
  const assignment = await AssignmentModel.findById(req.params.id).lean();
  if (!assignment) { res.status(404).json({ success: false, error: 'Not found' }); return; }
  res.json({ success: true, data: assignment });
});

// POST /api/assignments/:id/regenerate
assignmentRouter.post('/:id/regenerate', async (req, res) => {
  const assignment = await AssignmentModel.findById(req.params.id);
  if (!assignment) { res.status(404).json({ success: false, error: 'Not found' }); return; }
  if (assignment.status === 'processing') { res.status(409).json({ success: false, error: 'Already processing' }); return; }

  await assignment.updateOne({ status: 'pending', paper: null, error: null });
  const queue = await getQueue();
  const job = await queue.add('generate', { assignmentId: assignment._id.toString(), input: assignment.input });
  await assignment.updateOne({ jobId: job.id });

  res.json({ success: true, message: 'Regeneration queued', data: { jobId: job.id } });
});

// DELETE /api/assignments/:id
assignmentRouter.delete('/:id', async (req, res) => {
  await AssignmentModel.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
});
