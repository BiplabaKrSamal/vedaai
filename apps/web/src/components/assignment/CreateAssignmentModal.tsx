'use client';

import { useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDropzone } from 'react-dropzone';
import {
  X, Plus, Trash2, Upload, FileText, Loader2,
  Calendar, BookOpen, GraduationCap, Sparkles,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import type { QuestionType } from '@vedaai/shared';

// ─── Validation ────────────────────────────────────────────────────────────
const QtSchema = z.object({
  type: z.enum(['mcq', 'short_answer', 'long_answer', 'true_false', 'fill_blanks']),
  count: z.number({ coerce: true }).int().min(1, 'Min 1').max(50, 'Max 50'),
  marksPerQuestion: z.number({ coerce: true }).min(0.5, 'Min 0.5').max(100, 'Max 100'),
});

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subject: z.string().min(1, 'Subject is required'),
  grade: z.string().min(1, 'Grade is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  totalMarks: z.number({ coerce: true }).min(1, 'Must be at least 1'),
  questionTypes: z.array(QtSchema).min(1, 'Add at least one question type'),
  additionalInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

const QT_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer / Essay' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blanks', label: 'Fill in the Blanks' },
];

// ─── Component ─────────────────────────────────────────────────────────────
export function CreateAssignmentModal() {
  const { showCreateModal, setShowCreateModal, createAssignment, isCreating } =
    useAssignmentStore();
  const { subscribeToAssignment } = useWebSocket();

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      difficulty: 'medium',
      totalMarks: 50,
      questionTypes: [{ type: 'mcq', count: 5, marksPerQuestion: 2 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questionTypes',
  });

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setUploadedFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const assignment = await createAssignment(
        {
          ...values,
          materialText: undefined,
          materialFileName: uploadedFile?.name,
        },
        uploadedFile || undefined
      );
      subscribeToAssignment(assignment._id);
      reset();
      setUploadedFile(null);
      setStep(1);
    } catch (err) {
      console.error('Failed to create assignment:', err);
    }
  };

  const handleClose = () => {
    setShowCreateModal(false);
    setStep(1);
    reset();
    setUploadedFile(null);
  };

  if (!showCreateModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(9, 14, 22, 0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        className="relative w-full max-w-2xl bg-[#161d27] border border-[#2a3547] rounded-2xl shadow-2xl animate-slide-up max-h-[90vh] flex flex-col"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,76,58,0.05)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d3d]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center">
              <Sparkles size={16} className="text-brand-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#f0f4f8]">Create Assignment</h2>
              <p className="text-xs text-[#4d6077]">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#4d6077] hover:text-[#f0f4f8] hover:bg-[#1c2533] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-[#1e2d3d]">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs font-medium text-[#8a9bb5] uppercase tracking-wider mb-4">
                  Assignment Details
                </p>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                    Assignment Title *
                  </label>
                  <input
                    {...register('title')}
                    placeholder="e.g. Chapter 5 - Photosynthesis Test"
                    className={clsx(
                      'w-full px-3.5 py-2.5 bg-[#0f141a] border rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077] transition-colors',
                      'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20',
                      errors.title ? 'border-red-500/50' : 'border-[#2a3547]'
                    )}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-400 mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Subject + Grade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                      <BookOpen size={11} className="inline mr-1" />Subject *
                    </label>
                    <input
                      {...register('subject')}
                      placeholder="e.g. Biology"
                      className={clsx(
                        'w-full px-3.5 py-2.5 bg-[#0f141a] border rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077]',
                        'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20',
                        errors.subject ? 'border-red-500/50' : 'border-[#2a3547]'
                      )}
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                      <GraduationCap size={11} className="inline mr-1" />Grade / Class *
                    </label>
                    <input
                      {...register('grade')}
                      placeholder="e.g. Grade 10"
                      className={clsx(
                        'w-full px-3.5 py-2.5 bg-[#0f141a] border rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077]',
                        'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20',
                        errors.grade ? 'border-red-500/50' : 'border-[#2a3547]'
                      )}
                    />
                  </div>
                </div>

                {/* Due date + Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                      <Calendar size={11} className="inline mr-1" />Due Date *
                    </label>
                    <input
                      {...register('dueDate')}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className={clsx(
                        'w-full px-3.5 py-2.5 bg-[#0f141a] border rounded-lg text-sm text-[#f0f4f8]',
                        'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20',
                        '[color-scheme:dark]',
                        errors.dueDate ? 'border-red-500/50' : 'border-[#2a3547]'
                      )}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                      Difficulty
                    </label>
                    <div className="relative">
                      <select
                        {...register('difficulty')}
                        className="w-full px-3.5 py-2.5 bg-[#0f141a] border border-[#2a3547] rounded-lg text-sm text-[#f0f4f8] appearance-none focus:outline-none focus:border-brand-500/50"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d6077] pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Total Marks */}
                <div>
                  <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                    Total Marks *
                  </label>
                  <input
                    {...register('totalMarks', { valueAsNumber: true })}
                    type="number"
                    min={1}
                    placeholder="50"
                    className={clsx(
                      'w-full px-3.5 py-2.5 bg-[#0f141a] border rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077]',
                      'focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20',
                      errors.totalMarks ? 'border-red-500/50' : 'border-[#2a3547]'
                    )}
                  />
                  {errors.totalMarks && (
                    <p className="text-xs text-red-400 mt-1">{errors.totalMarks.message}</p>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs font-medium text-[#8a9bb5] uppercase tracking-wider mb-4">
                  Question Configuration
                </p>

                {/* Question Types */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-medium text-[#8a9bb5]">
                      Question Types *
                    </label>
                    <button
                      type="button"
                      onClick={() => append({ type: 'short_answer', count: 3, marksPerQuestion: 5 })}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-lg text-xs text-brand-400 hover:bg-brand-500/20 transition-colors"
                    >
                      <Plus size={12} /> Add Type
                    </button>
                  </div>

                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-3 bg-[#0f141a] border border-[#2a3547] rounded-lg"
                      >
                        <div className="w-5 h-5 rounded-md bg-brand-500/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-brand-400">
                          {String.fromCharCode(65 + index)}
                        </div>

                        <Controller
                          control={control}
                          name={`questionTypes.${index}.type`}
                          render={({ field: f }) => (
                            <div className="relative flex-1">
                              <select
                                {...f}
                                className="w-full px-2.5 py-1.5 bg-[#161d27] border border-[#2a3547] rounded-md text-xs text-[#f0f4f8] appearance-none focus:outline-none focus:border-brand-500/50"
                              >
                                {QT_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>
                                    {o.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        />

                        <div className="flex items-center gap-1 shrink-0">
                          <input
                            {...register(`questionTypes.${index}.count`, { valueAsNumber: true })}
                            type="number"
                            min={1}
                            max={50}
                            placeholder="Qty"
                            className="w-14 px-2 py-1.5 bg-[#161d27] border border-[#2a3547] rounded-md text-xs text-[#f0f4f8] text-center focus:outline-none focus:border-brand-500/50"
                          />
                          <span className="text-[10px] text-[#4d6077]">×</span>
                          <input
                            {...register(`questionTypes.${index}.marksPerQuestion`, { valueAsNumber: true })}
                            type="number"
                            min={0.5}
                            step={0.5}
                            placeholder="Marks"
                            className="w-16 px-2 py-1.5 bg-[#161d27] border border-[#2a3547] rounded-md text-xs text-[#f0f4f8] text-center focus:outline-none focus:border-brand-500/50"
                          />
                          <span className="text-[10px] text-[#4d6077]">m</span>
                        </div>

                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="p-1 rounded text-[#4d6077] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.questionTypes && (
                    <p className="text-xs text-red-400 mt-1">
                      {errors.questionTypes.message || 'Check question type values'}
                    </p>
                  )}
                </div>

                {/* Upload material */}
                <div>
                  <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                    Upload Source Material <span className="text-[#4d6077]">(optional)</span>
                  </label>
                  <div
                    {...getRootProps()}
                    className={clsx(
                      'relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200',
                      isDragActive
                        ? 'border-brand-500/50 bg-brand-500/5'
                        : 'border-[#2a3547] hover:border-[#3a4557] hover:bg-[#1c2533]/50',
                      uploadedFile && 'border-green-500/30 bg-green-500/5'
                    )}
                  >
                    <input {...getInputProps()} />
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText size={16} className="text-green-400" />
                        <span className="text-sm text-green-400 font-medium">{uploadedFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          className="ml-1 text-[#4d6077] hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={20} className="mx-auto text-[#4d6077] mb-2" />
                        <p className="text-xs text-[#8a9bb5]">
                          Drop PDF or TXT file here, or <span className="text-brand-400">browse</span>
                        </p>
                        <p className="text-[10px] text-[#4d6077] mt-1">Max 10MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional instructions */}
                <div>
                  <label className="block text-xs font-medium text-[#8a9bb5] mb-1.5">
                    Additional Instructions <span className="text-[#4d6077]">(optional)</span>
                  </label>
                  <textarea
                    {...register('additionalInstructions')}
                    rows={3}
                    placeholder="e.g. Focus on chapters 3-5, include diagram-based questions..."
                    className="w-full px-3.5 py-2.5 bg-[#0f141a] border border-[#2a3547] rounded-lg text-sm text-[#f0f4f8] placeholder-[#4d6077] resize-none focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1e2d3d] flex items-center justify-between">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-[#8a9bb5] hover:text-[#f0f4f8] transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm border border-[#2a3547] rounded-lg text-[#8a9bb5] hover:text-[#f0f4f8] hover:border-[#3a4557] transition-colors"
                >
                  Back
                </button>
              )}
              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Questions →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-5 py-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isCreating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate Paper
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
