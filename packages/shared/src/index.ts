// ─────────────────────────────────────────────
// Assignment Types
// ─────────────────────────────────────────────

export type Difficulty = 'easy' | 'medium' | 'hard';

export type QuestionType =
  | 'mcq'
  | 'short_answer'
  | 'long_answer'
  | 'true_false'
  | 'fill_blanks';

export interface QuestionTypeConfig {
  type: QuestionType;
  count: number;
  marksPerQuestion: number;
}

export interface AssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  totalMarks: number;
  difficulty: Difficulty;
  additionalInstructions?: string;
  materialText?: string;
  materialFileName?: string;
}

// ─────────────────────────────────────────────
// Generated Paper Types
// ─────────────────────────────────────────────

export interface GeneratedQuestion {
  id: string;
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[]; // for MCQ
}

export interface GeneratedSection {
  id: string;
  title: string;         // "Section A"
  instruction: string;   // "Attempt all questions"
  questions: GeneratedQuestion[];
  totalMarks: number;
}

export interface GeneratedPaper {
  id: string;
  assignmentId: string;
  title: string;
  subject: string;
  grade: string;
  totalMarks: number;
  duration?: string;
  sections: GeneratedSection[];
  generatedAt: string;
}

// ─────────────────────────────────────────────
// Assignment Document (DB shape)
// ─────────────────────────────────────────────

export type AssignmentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Assignment {
  _id: string;
  input: AssignmentInput;
  status: AssignmentStatus;
  paper?: GeneratedPaper;
  jobId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────
// WebSocket Event Types
// ─────────────────────────────────────────────

export type WsEventType =
  | 'job:queued'
  | 'job:processing'
  | 'job:completed'
  | 'job:failed';

export interface WsEvent {
  type: WsEventType;
  assignmentId: string;
  data?: unknown;
}

// ─────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
