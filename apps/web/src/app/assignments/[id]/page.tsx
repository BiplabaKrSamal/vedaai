'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { PaperOutput } from '@/components/output/PaperOutput';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastWsConnector } from '@/components/ui/ToastWsConnector';
import type { Assignment } from '@vedaai/shared';

const PROCESSING_STEPS = [
  'Analysing input',
  'Structuring sections',
  'Generating questions',
  'Finalising paper',
];

function ProcessingState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 px-8 text-center">
      <div className="relative mb-8">
        <div className={clsx(
          'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto',
          status === 'failed'
            ? 'bg-red-500/10 border border-red-500/20'
            : 'bg-blue-500/10 border border-blue-500/20',
        )}>
          {status === 'failed'
            ? <AlertCircle size={24} className="text-red-400" />
            : <Loader2   size={24} className="text-blue-400 animate-spin" />
          }
        </div>
        {status !== 'failed' && (
          <div className="absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-blue-500/5 animate-ping" />
        )}
      </div>

      <h2 className="text-lg font-semibold text-[#f0f4f8] mb-2">
        {status === 'pending'    && 'Queued for Generation'}
        {status === 'processing' && 'AI is Generating Your Paper…'}
        {status === 'failed'     && 'Generation Failed'}
      </h2>
      <p className="text-sm text-[#8a9bb5] max-w-xs leading-relaxed mb-8">
        {status === 'pending'    && 'Your assignment is queued. Generation starts in moments.'}
        {status === 'processing' && 'Our AI is crafting a structured question paper. This takes 15–30 seconds.'}
        {status === 'failed'     && 'Something went wrong during generation. You can try regenerating below.'}
      </p>

      {status !== 'failed' && (
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
          {PROCESSING_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2 text-[11px] text-[#4d6077]">
              {i > 0 && <span className="text-[#1e2d3d]">›</span>}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161d27] border border-[#2a3547]">
                <div
                  className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
                  style={{ animationDelay: `${i * 250}ms` }}
                />
                {step}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// needed for JSX in same file
import { clsx } from 'clsx';

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [assignment,     setAssignment]     = useState<Assignment | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const { updateAssignmentStatus, regenerateAssignment, assignments } = useAssignmentStore();
  const { subscribeToAssignment } = useWebSocket();

  // Sync live store updates (WS pushes) back to local state
  useEffect(() => {
    const storeAssignment = assignments.find((a) => a._id === id);
    if (storeAssignment && storeAssignment.status !== assignment?.status) {
      setAssignment(storeAssignment);
    }
  }, [assignments, id, assignment?.status]);

  const loadAssignment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.getAssignment(id);
      setAssignment(data);
      if (data.status === 'pending' || data.status === 'processing') {
        subscribeToAssignment(id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, subscribeToAssignment]);

  useEffect(() => { loadAssignment(); }, [loadAssignment]);

  // Fallback polling when WS isn't subscribed yet
  useEffect(() => {
    if (!assignment) return;
    if (assignment.status === 'completed' || assignment.status === 'failed') return;

    const timer = setInterval(async () => {
      const updated = await api.getAssignment(id).catch(() => null);
      if (updated) {
        setAssignment(updated);
        if (updated.status === 'completed' || updated.status === 'failed') {
          clearInterval(timer);
        }
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [assignment?.status, id]);

  const handleRegenerate = async () => {
    if (!assignment) return;
    setIsRegenerating(true);
    try {
      await regenerateAssignment(assignment._id);
      setAssignment((prev) => prev ? { ...prev, status: 'pending', paper: undefined } : prev);
      subscribeToAssignment(assignment._id);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f141a] overflow-hidden">
      <ToastWsConnector />
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-4 px-6 py-4 border-b border-[#1e2d3d] shrink-0">
          <Link
            href="/assignments"
            className="flex items-center gap-1.5 text-xs text-[#8a9bb5] hover:text-[#f0f4f8] transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </Link>
          <div className="h-4 w-px bg-[#2a3547]" />
          {loading ? (
            <div className="h-4 w-52 skeleton rounded" />
          ) : (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#f0f4f8] truncate">
                  {assignment?.input.title}
                </p>
                <p className="text-xs text-[#4d6077]">
                  {assignment?.input.subject} · Grade {assignment?.input.grade}
                </p>
              </div>
              {assignment?.status === 'failed' && (
                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-[#161d27] border border-[#2a3547] rounded-lg text-xs text-[#8a9bb5] hover:text-[#f0f4f8] hover:border-[#3a4557] transition-colors disabled:opacity-50"
                >
                  {isRegenerating
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RefreshCw size={12} />
                  }
                  Retry Generation
                </button>
              )}
            </div>
          )}
        </header>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 size={22} className="text-brand-400 animate-spin" />
          </div>
        ) : !assignment ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <p className="text-sm text-[#8a9bb5]">Assignment not found</p>
            <Link href="/assignments" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              ← View all assignments
            </Link>
          </div>
        ) : assignment.status === 'completed' && assignment.paper ? (
          <PaperOutput
            paper={assignment.paper}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />
        ) : (
          <ProcessingState status={assignment.status} />
        )}
      </main>
    </div>
  );
}
