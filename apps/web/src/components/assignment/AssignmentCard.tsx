'use client';

import { Clock, FileText, Trash2, RefreshCw, Eye, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';
import type { Assignment } from '@vedaai/shared';
import { useAssignmentStore } from '@/store/assignmentStore';

const STATUS_CONFIG = {
  pending: { label: 'Queued', className: 'badge-pending', dot: 'bg-amber-400' },
  processing: { label: 'Generating...', className: 'badge-processing', dot: 'bg-blue-400 animate-pulse' },
  completed: { label: 'Ready', className: 'badge-completed', dot: 'bg-green-400' },
  failed: { label: 'Failed', className: 'badge-failed', dot: 'bg-red-400' },
};

const DIFF_CONFIG = {
  easy: 'diff-easy',
  medium: 'diff-medium',
  hard: 'diff-hard',
};

interface AssignmentCardProps {
  assignment: Assignment;
  isActive?: boolean;
  onClick?: () => void;
}

export function AssignmentCard({ assignment, isActive, onClick }: AssignmentCardProps) {
  const { deleteAssignment, regenerateAssignment, setActiveAssignment } = useAssignmentStore();
  const status = STATUS_CONFIG[assignment.status];
  const { input } = assignment;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this assignment?')) {
      await deleteAssignment(assignment._id);
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await regenerateAssignment(assignment._id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveAssignment(assignment._id);
    window.location.href = `/assignments/${assignment._id}`;
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'group relative rounded-xl border cursor-pointer transition-all duration-200',
        'bg-[#161d27] hover:bg-[#1c2533]',
        isActive
          ? 'border-brand-500/40 shadow-lg shadow-brand-500/5'
          : 'border-[#1e2d3d] hover:border-[#2a3547]'
      )}
    >
      {/* Status stripe */}
      {isActive && (
        <div className="absolute left-0 top-4 bottom-4 w-0.5 rounded-full bg-brand-500" />
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-brand-500/10 flex items-center justify-center shrink-0">
                <FileText size={12} className="text-brand-400" />
              </div>
              <h3 className="text-sm font-semibold text-[#f0f4f8] truncate">
                {input.title}
              </h3>
            </div>
            <p className="text-xs text-[#8a9bb5] ml-8">{input.subject} · Grade {input.grade}</p>
          </div>

          {/* Status badge */}
          <div className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0', status.className)}>
            {assignment.status === 'processing' ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <div className={clsx('w-1.5 h-1.5 rounded-full', status.dot)} />
            )}
            {status.label}
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-3">
          <span className={clsx('px-2 py-0.5 rounded-md text-[10px] font-medium capitalize', DIFF_CONFIG[input.difficulty])}>
            {input.difficulty}
          </span>
          <span className="text-[10px] text-[#4d6077]">
            {input.totalMarks} marks
          </span>
          <span className="text-[10px] text-[#4d6077] flex items-center gap-1">
            <Clock size={10} />
            Due {format(new Date(input.dueDate), 'MMM d')}
          </span>
        </div>

        {/* Question types summary */}
        <div className="flex flex-wrap gap-1 mb-3">
          {input.questionTypes.slice(0, 3).map((qt) => (
            <span
              key={qt.type}
              className="px-1.5 py-0.5 bg-[#1c2533] border border-[#2a3547] rounded text-[9px] text-[#8a9bb5] capitalize"
            >
              {qt.type.replace('_', ' ')} ×{qt.count}
            </span>
          ))}
          {input.questionTypes.length > 3 && (
            <span className="px-1.5 py-0.5 bg-[#1c2533] border border-[#2a3547] rounded text-[9px] text-[#8a9bb5]">
              +{input.questionTypes.length - 3}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1e2d3d]">
          <span className="text-[10px] text-[#4d6077]">
            {format(new Date(assignment.createdAt), 'MMM d, yyyy')}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {assignment.status === 'completed' && (
              <button
                onClick={handleView}
                className="p-1.5 rounded-lg text-[#8a9bb5] hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                title="View paper"
              >
                <Eye size={13} />
              </button>
            )}
            {(assignment.status === 'completed' || assignment.status === 'failed') && (
              <button
                onClick={handleRegenerate}
                className="p-1.5 rounded-lg text-[#8a9bb5] hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                title="Regenerate"
              >
                <RefreshCw size={13} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-[#8a9bb5] hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
