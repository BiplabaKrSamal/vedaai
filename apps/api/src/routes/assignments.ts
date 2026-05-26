import { Router, Request, Response } from 'express';
import type { IRouter } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { AssignmentModel } from '../models/Assignment';
import { getQueue } from '../services/queue';
import { broadcastToAssignment } from '../socket/wsServer';
import type { ApiResponse } from '@vedaai/shared';

export const assignmentRouter: IRouter = Router();

// Multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'));
    }
  },
});

// Validation schema
const QuestionTypeSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks']),
  count: z.number().int().min(1).max(50),
  marksPerQuestion: z.number().min(0.5).max(100),
});

const CreateAssignmentSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  grade: z.string().min(1).max(50),
  dueDate: z.string().min(1),
  questionTypes: z.array(QuestionTypeSchema).min(1),
  totalMarks: z.number().min(1).max(500),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  additionalInstructions: z.string().optional(),
  materialText: z.string().optional(),
  materialFileName: z.string().optional(),
});

// POST /api/assignments — create + enqueue
assignmentRouter.post(
  '/',
  upload.single('material'),
  async (req: Request, res: Response) => {
    try {
      // Parse body (might be JSON string when file upload is used)
      let body = req.body;
      if (typeof body.data === 'string') {
        body = JSON.parse(body.data);
      }

      // Handle file upload
      if (req.file) {
        if (req.file.mimetype === 'text/plain') {
          body.materialText = req.file.buffer.toString('utf-8');
        } else if (req.file.mimetype === 'application/pdf') {
          // For PDF, we'd use pdf-parse; for now store note
          body.materialText = `[PDF file uploaded: ${req.file.originalname}]`;
        }
        body.materialFileName = req.file.originalname;
      }

      // Parse numeric fields (FormData sends strings)
      if (typeof body.totalMarks === 'string') {
        body.totalMarks = Number(body.totalMarks);
      }
      if (typeof body.questionTypes === 'string') {
        body.questionTypes = JSON.parse(body.questionTypes);
      }
      body.questionTypes?.forEach((qt: { count: string | number; marksPerQuestion: string | number }) => {
        qt.count = Number(qt.count);
        qt.marksPerQuestion = Number(qt.marksPerQuestion);
      });

      const parsed = CreateAssignmentSchema.safeParse(body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          data: parsed.error.flatten(),
        } satisfies ApiResponse);
        return;
      }

      const input = parsed.data;

      // Save to DB
      const assignment = await AssignmentModel.create({ input, status: 'pending' });

      // Enqueue generation job
      const queue = getQueue();
      const job = await queue.add('generate', {
        assignmentId: assignment._id.toString(),
        input,
      });

      // Update with jobId
      await assignment.updateOne({ jobId: job.id });

      // Broadcast queued event to all clients
      broadcastToAssignment({
        type: 'job:queued',
        assignmentId: assignment._id.toString(),
      });

      res.status(201).json({
        success: true,
        data: {
          _id: assignment._id,
          status: 'pending',
          jobId: job.id,
        },
        message: 'Assignment created and queued for generation',
      } satisfies ApiResponse);
    } catch (err) {
      console.error('POST /assignments error:', err);
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Internal server error',
      } satisfies ApiResponse);
    }
  }
);

// GET /api/assignments — list all
assignmentRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const assignments = await AssignmentModel.find()
      .sort({ createdAt: -1 })
      .select('-paper.sections.questions') // exclude heavy data in list
      .lean();

    res.json({ success: true, data: assignments } satisfies ApiResponse);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignments' });
  }
});

// GET /api/assignments/:id — single assignment with full paper
assignmentRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id).lean();
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    res.json({ success: true, data: assignment } satisfies ApiResponse);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch assignment' });
  }
});

// POST /api/assignments/:id/regenerate
assignmentRouter.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }
    if (assignment.status === 'processing') {
      res.status(409).json({ success: false, error: 'Already processing' });
      return;
    }

    await assignment.updateOne({ status: 'pending', paper: null, error: null });

    const queue = getQueue();
    const job = await queue.add('generate', {
      assignmentId: assignment._id.toString(),
      input: assignment.input,
    });

    await assignment.updateOne({ jobId: job.id });

    res.json({
      success: true,
      message: 'Regeneration queued',
      data: { jobId: job.id },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to regenerate' });
  }
});

// DELETE /api/assignments/:id
assignmentRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await AssignmentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete' });
  }
});
