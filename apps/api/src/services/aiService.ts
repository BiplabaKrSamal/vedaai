import Anthropic from '@anthropic-ai/sdk';
import type {
  AssignmentInput,
  GeneratedPaper,
  GeneratedSection,
  GeneratedQuestion,
  QuestionType,
  Difficulty,
} from '@vedaai/shared';
import { v4 as uuid } from 'uuid';
import { generateDemoPaper } from './demoData';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq:          'Multiple Choice Questions (with 4 options labeled A–D)',
  short_answer: 'Short Answer Questions (2–3 sentences)',
  long_answer:  'Long Answer / Essay Questions',
  true_false:   'True or False Questions',
  fill_blanks:  'Fill in the Blanks',
};

function estimateDuration(totalMarks: number): string {
  if (totalMarks <= 20)  return '30 Minutes';
  if (totalMarks <= 40)  return '1 Hour';
  if (totalMarks <= 60)  return '1.5 Hours';
  if (totalMarks <= 80)  return '2 Hours';
  return '3 Hours';
}

function buildPrompt(input: AssignmentInput): string {
  const qtLines = input.questionTypes
    .map(q => `  - ${QUESTION_TYPE_LABELS[q.type]}: ${q.count} question(s), ${q.marksPerQuestion} marks each`)
    .join('\n');

  const materialSection = input.materialText
    ? `\n\nSOURCE MATERIAL (use as primary content basis):\n"""\n${input.materialText.slice(0, 6000)}\n"""`
    : '';

  return `You are an expert academic question paper generator. Create a structured exam paper.

ASSIGNMENT DETAILS:
- Title: ${input.title}
- Subject: ${input.subject}
- Grade/Class: ${input.grade}
- Overall Difficulty: ${input.difficulty}
- Total Marks: ${input.totalMarks}
${input.additionalInstructions ? `- Special Instructions: ${input.additionalInstructions}` : ''}

QUESTION REQUIREMENTS:
${qtLines}
${materialSection}

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no explanation:
{
  "title": "string",
  "duration": "string (e.g. '2 Hours')",
  "sections": [
    {
      "title": "Section A",
      "instruction": "string",
      "questions": [
        {
          "text": "string",
          "type": "mcq|short_answer|long_answer|true_false|fill_blanks",
          "difficulty": "easy|medium|hard",
          "marks": number,
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."]
        }
      ]
    }
  ]
}

RULES:
1. Group questions by type into separate sections
2. For MCQ always provide exactly 4 options prefixed A. B. C. D.
3. Do NOT include answer keys
4. Respond ONLY with the JSON object — no other text`;
}

interface RawQuestion { text: string; type: string; difficulty: string; marks: number; options?: string[]; }
interface RawSection  { title: string; instruction: string; questions: RawQuestion[]; }
interface RawPaper    { title: string; duration?: string; sections: RawSection[]; }

// ─── Real Claude generation ────────────────────────────────────────────────────

async function generateWithClaude(
  assignmentId: string,
  input: AssignmentInput
): Promise<GeneratedPaper> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: buildPrompt(input) }],
  });

  const rawText = response.content
    .filter(b => b.type === 'text')
    .map(b => (b as { type: 'text'; text: string }).text)
    .join('');

  const jsonText = rawText
    .replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

  let rawPaper: RawPaper;
  try {
    rawPaper = JSON.parse(jsonText);
  } catch {
    throw new Error(`Failed to parse AI response: ${jsonText.slice(0, 200)}`);
  }

  const sections: GeneratedSection[] = rawPaper.sections.map((sec, si) => {
    const questions: GeneratedQuestion[] = sec.questions.map((q, qi) => ({
      id:         `q-${si}-${qi}-${uuid().slice(0, 8)}`,
      text:       q.text,
      type:       (q.type as QuestionType) || 'short_answer',
      difficulty: (q.difficulty as Difficulty) || input.difficulty,
      marks:      Number(q.marks) || 1,
      options:    q.options,
    }));

    return {
      id:          `sec-${si}-${uuid().slice(0, 8)}`,
      title:       sec.title || `Section ${String.fromCharCode(65 + si)}`,
      instruction: sec.instruction || 'Attempt all questions.',
      questions,
      totalMarks:  questions.reduce((s, q) => s + q.marks, 0),
    };
  });

  return {
    id:           uuid(),
    assignmentId,
    title:        rawPaper.title || input.title,
    subject:      input.subject,
    grade:        input.grade,
    totalMarks:   sections.reduce((s, sec) => s + sec.totalMarks, 0),
    duration:     rawPaper.duration || estimateDuration(input.totalMarks),
    sections,
    generatedAt:  new Date().toISOString(),
  };
}

// ─── Public entry point — auto-selects mode ───────────────────────────────────

export async function generatePaper(
  assignmentId: string,
  input: AssignmentInput
): Promise<GeneratedPaper> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isDemoKey = !apiKey || apiKey === 'demo' || apiKey.startsWith('demo-');

  if (isDemoKey) {
    console.log(`[AI] Demo mode — generating paper without Claude API`);
    // Simulate realistic processing delay (1–2 s)
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));
    return generateDemoPaper(assignmentId, input);
  }

  console.log(`[AI] Claude mode — calling Anthropic API`);
  return generateWithClaude(assignmentId, input);
}
