import mongoose, { Schema, Document } from 'mongoose';
import type { Assignment, AssignmentInput, GeneratedPaper } from '@vedaai/shared';
import { AssignmentMemoryModel } from '../store/InMemoryStore';

export interface AssignmentDoc extends Omit<Assignment, '_id'>, Document {}

const QuestionTypeConfigSchema = new Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
  marksPerQuestion: { type: Number, required: true },
});

const AssignmentInputSchema = new Schema<AssignmentInput>({
  title:    { type: String, required: true },
  subject:  { type: String, required: true },
  grade:    { type: String, required: true },
  dueDate:  { type: String, required: true },
  questionTypes: [QuestionTypeConfigSchema],
  totalMarks:    { type: Number, required: true },
  difficulty:    { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  additionalInstructions: { type: String },
  materialText:    { type: String },
  materialFileName:{ type: String },
});

const GeneratedQuestionSchema = new Schema({
  id: String, text: String, type: String,
  difficulty: String, marks: Number, options: [String],
});

const GeneratedSectionSchema = new Schema({
  id: String, title: String, instruction: String,
  questions: [GeneratedQuestionSchema], totalMarks: Number,
});

const GeneratedPaperSchema = new Schema<GeneratedPaper>({
  id: String, assignmentId: String, title: String,
  subject: String, grade: String, totalMarks: Number,
  duration: String, sections: [GeneratedSectionSchema], generatedAt: String,
});

const AssignmentSchema = new Schema<AssignmentDoc>(
  {
    input:  { type: AssignmentInputSchema, required: true },
    status: { type: String, enum: ['pending','processing','completed','failed'], default: 'pending' },
    paper:  { type: GeneratedPaperSchema },
    jobId:  { type: String },
    error:  { type: String },
  },
  { timestamps: true }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModel = any;

const isDemo = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'demo';

export const AssignmentModel: AnyModel = isDemo
  ? AssignmentMemoryModel
  : (mongoose.models['Assignment'] ?? mongoose.model<AssignmentDoc>('Assignment', AssignmentSchema));
