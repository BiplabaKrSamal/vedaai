'use client';

import { useState, useRef } from 'react';
import {
  Download, RefreshCw, Printer, ChevronDown, ChevronUp,
  Loader2, BookOpen, Clock, Award, Layers
} from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { GeneratedPaper, GeneratedQuestion } from '@vedaai/shared';
import { downloadPaperAsPDF } from '@/lib/pdfExport';

// ─── Config ──────────────────────────────────────────────────────────
const DIFF_CONFIG: Record<string, { label: string; cls: string }> = {
  easy:   { label: 'Easy',     cls: 'diff-easy'   },
  medium: { label: 'Moderate', cls: 'diff-medium'  },
  hard:   { label: 'Hard',     cls: 'diff-hard'    },
};

const TYPE_LABELS: Record<string, string> = {
  mcq:          'MCQ',
  short_answer: 'Short Answer',
  long_answer:  'Long Answer',
  true_false:   'True / False',
  fill_blanks:  'Fill Blanks',
};

const SECTION_COLORS = [
  'from-brand-500/20 to-brand-600/10 border-brand-500/30 text-brand-400',
  'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
  'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
  'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
];

// ─── Question Item ────────────────────────────────────────────────────
function QuestionItem({
  question,
  index,
  sectionIndex,
}: {
  question: GeneratedQuestion;
  index: number;
  sectionIndex: number;
}) {
  const [optionsOpen, setOptionsOpen] = useState(true);
  const diff = DIFF_CONFIG[question.difficulty] ?? DIFF_CONFIG.medium;
  const isMcq = question.type === 'mcq' && question.options?.length;

  return (
    <div className="group border border-[#2a3547] hover:border-[#3a4557] rounded-xl overflow-hidden bg-[#0f141a] transition-all duration-150 print:border-gray-200 print:bg-white">
      {/* Question row */}
      <div
        className={clsx('flex items-start gap-3 p-4', isMcq && 'cursor-pointer')}
        onClick={() => isMcq && setOptionsOpen((v) => !v)}
      >
        {/* Index badge */}
        <div className="w-6 h-6 rounded-md bg-[#1c2533] border border-[#2a3547] flex items-center justify-center shrink-0 text-[10px] font-bold text-[#8a9bb5] mt-0.5 print:border-gray-300 print:text-gray-600">
          {index + 1}
        </div>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[#e8eef4] leading-relaxed print:text-gray-900">
            {question.text}
          </p>
        </div>

        {/* Meta badges */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-semibold print:border', diff.cls)}>
            {diff.label}
          </span>
          <span className="hidden sm:inline px-2 py-0.5 bg-[#1c2533] border border-[#2a3547] rounded-md text-[10px] text-[#8a9bb5] print:border-gray-200 print:text-gray-500">
            {TYPE_LABELS[question.type] ?? question.type}
          </span>
          <div className="flex items-center gap-0.5 px-2 py-0.5 bg-brand-500/10 border border-brand-500/20 rounded-md print:border-gray-300 print:bg-gray-50">
            <span className="text-[10px] font-bold text-brand-400 print:text-gray-700">
              {question.marks}
            </span>
            <span className="text-[9px] text-brand-400/70 print:text-gray-500">M</span>
          </div>
          {isMcq && (
            <span className="text-[#4d6077]">
              {optionsOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          )}
        </div>
      </div>

      {/* MCQ Options */}
      {isMcq && optionsOpen && (
        <div className="px-4 pb-4 ml-9 space-y-1.5 print:block">
          {question.options!.map((opt, oi) => (
            <label
              key={oi}
              className="flex items-center gap-3 px-3 py-2.5 bg-[#141b24] border border-[#2a3547] rounded-lg cursor-pointer hover:border-[#3a4557] hover:bg-[#1a2230] transition-colors group/opt print:border-gray-200 print:bg-white"
            >
              <div className="w-4 h-4 rounded-full border-2 border-[#3a4557] shrink-0 group-hover/opt:border-[#4d6077] print:border-gray-400" />
              <span className="text-xs text-[#c0ccda] print:text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Long/short answer blank */}
      {(question.type === 'long_answer' || question.type === 'short_answer') && (
        <div className="px-4 pb-4 ml-9 print:block">
          <div
            className={clsx(
              'border border-dashed border-[#2a3547] rounded-lg p-3',
              question.type === 'long_answer' ? 'h-28' : 'h-14',
              'print:border-gray-300'
            )}
          >
            <span className="text-[10px] text-[#2a3547] print:text-gray-300">Answer here</span>
          </div>
        </div>
      )}

      {/* Fill blanks / T-F */}
      {(question.type === 'fill_blanks' || question.type === 'true_false') && (
        <div className="px-4 pb-3 ml-9">
          <div className="h-7 border-b border-dashed border-[#2a3547] print:border-gray-400" />
        </div>
      )}
    </div>
  );
}

// ─── Section Block ────────────────────────────────────────────────────
function SectionBlock({
  section,
  index,
}: {
  section: GeneratedPaper['sections'][0];
  index: number;
}) {
  const colorCls = SECTION_COLORS[index % SECTION_COLORS.length];

  return (
    <div className="space-y-3 animate-fade-in print:break-inside-avoid">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={clsx('w-9 h-9 rounded-xl bg-gradient-to-br border flex items-center justify-center shrink-0 print:bg-gray-100 print:border-gray-300', colorCls)}>
            <span className="text-sm font-bold print:text-gray-700">
              {String.fromCharCode(65 + index)}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0f4f8] print:text-gray-900">
              {section.title}
            </h3>
            <p className="text-[11px] text-[#8a9bb5] italic print:text-gray-500">
              {section.instruction}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[10px] text-[#4d6077] print:text-gray-400">Total</p>
          <p className="text-sm font-bold text-[#f0f4f8] print:text-gray-900">
            {section.totalMarks}
            <span className="text-xs font-normal text-[#4d6077] ml-0.5">M</span>
          </p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-2">
        {section.questions.map((q, qi) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={qi}
            sectionIndex={index}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Paper Output ─────────────────────────────────────────────────────
interface PaperOutputProps {
  paper: GeneratedPaper;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function PaperOutput({ paper, onRegenerate, isRegenerating }: PaperOutputProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const totalQuestions = paper.sections.reduce(
    (t, s) => t + s.questions.length, 0
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadPaperAsPDF(paper);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Action bar ── */}
      <div className="flex items-center justify-between px-5 py-3 bg-[#0f141a] border-b border-[#1e2d3d] shrink-0 print:hidden">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold text-[#f0f4f8] leading-tight">
              {paper.title}
            </p>
            <p className="text-[10px] text-[#4d6077] mt-0.5">
              {totalQuestions} questions · {paper.totalMarks} marks · {paper.duration}
            </p>
          </div>
          {/* Quick stats */}
          <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-[#1e2d3d]">
            {[
              { icon: Layers, label: `${paper.sections.length} sections` },
              { icon: Clock, label: paper.duration ?? 'N/A' },
              { icon: Award, label: `${paper.totalMarks} marks` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-[#4d6077]">
                <Icon size={11} />
                {label}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#161d27] border border-[#2a3547] rounded-lg text-xs text-[#8a9bb5] hover:text-[#f0f4f8] hover:border-[#3a4557] transition-colors disabled:opacity-50"
            >
              {isRegenerating
                ? <Loader2 size={12} className="animate-spin" />
                : <RefreshCw size={12} />
              }
              Regenerate
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161d27] border border-[#2a3547] rounded-lg text-xs text-[#8a9bb5] hover:text-[#f0f4f8] hover:border-[#3a4557] transition-colors"
          >
            <Printer size={12} />
            Print
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-md hover:shadow-brand-500/25"
          >
            {isDownloading
              ? <Loader2 size={12} className="animate-spin" />
              : <Download size={12} />
            }
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Paper body ── */}
      <div className="flex-1 overflow-y-auto bg-[#0c1117] print:bg-white">
        <div
          ref={paperRef}
          className="max-w-3xl mx-auto px-5 py-6 space-y-6 print:px-8 print:py-10 print:max-w-none"
        >
          {/* Paper header card */}
          <div className="bg-[#161d27] border border-[#2a3547] rounded-2xl overflow-hidden print:border-gray-200 print:bg-white print:rounded-none">
            {/* Red accent stripe */}
            <div className="h-1 bg-gradient-to-r from-brand-700 via-brand-500 to-brand-400 print:bg-red-600" />

            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <BookOpen size={14} className="text-brand-400 print:text-red-600" />
                <span className="text-[10px] font-bold text-brand-400 uppercase tracking-[0.15em] print:text-red-600">
                  AI Generated Assessment · VedaAI
                </span>
              </div>
              <h1 className="text-xl font-bold text-[#f0f4f8] mb-2 leading-tight print:text-gray-900 print:text-2xl">
                {paper.title}
              </h1>

              {/* Meta row */}
              <div className="flex items-center justify-center gap-2 flex-wrap mt-3">
                {[
                  { label: 'Subject', value: paper.subject },
                  { label: 'Grade', value: paper.grade },
                  { label: 'Duration', value: paper.duration ?? 'N/A' },
                  { label: 'Total Marks', value: `${paper.totalMarks}` },
                ].map(({ label, value }, i) => (
                  <span key={label} className="flex items-center gap-1 text-xs text-[#8a9bb5] print:text-gray-600">
                    {i > 0 && <span className="text-[#2a3547] mr-1 print:text-gray-300">·</span>}
                    <span className="text-[#4d6077] print:text-gray-400">{label}:</span>
                    <span className="font-medium text-[#c0ccda] print:text-gray-800">{value}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Student info */}
            <div className="mx-5 mb-5 p-4 bg-[#0f141a] border border-[#2a3547] rounded-xl print:border-gray-300 print:bg-gray-50">
              <p className="text-[9px] font-bold text-[#4d6077] uppercase tracking-widest mb-3 print:text-gray-400">
                Student Information
              </p>
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {[
                  'Student Name',
                  'Roll Number',
                  'Section',
                  'Date',
                  'Teacher',
                  'Max. Marks',
                ].map((label) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <span className="text-[9px] text-[#4d6077] font-medium print:text-gray-400">
                      {label}
                    </span>
                    <div className="h-7 border-b border-[#2a3547] print:border-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* General instructions */}
            <div className="mx-5 mb-5 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl print:border-yellow-200 print:bg-yellow-50">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 print:text-yellow-700">
                General Instructions
              </p>
              <ul className="space-y-0.5">
                {[
                  'All questions are compulsory unless stated otherwise.',
                  'Write your name and roll number clearly on the answer sheet.',
                  'Marks for each question are indicated in brackets.',
                  'Use a blue/black ballpoint pen only.',
                ].map((inst) => (
                  <li
                    key={inst}
                    className="text-[11px] text-[#8a9bb5] flex items-start gap-1.5 print:text-gray-600"
                  >
                    <span className="text-amber-400/60 mt-0.5 shrink-0 print:text-yellow-500">›</span>
                    {inst}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sections */}
          {paper.sections.map((section, si) => (
            <SectionBlock key={section.id} section={section} index={si} />
          ))}

          {/* Footer */}
          <div className="text-center py-4 border-t border-[#1e2d3d] print:border-gray-200">
            <p className="text-[10px] text-[#4d6077] print:text-gray-400">
              Generated by VedaAI ·{' '}
              {format(new Date(paper.generatedAt), 'dd MMM yyyy, hh:mm a')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
