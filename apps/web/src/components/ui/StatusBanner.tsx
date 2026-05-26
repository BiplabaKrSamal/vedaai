'use client';

import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import type { AssignmentStatus } from '@vedaai/shared';

interface StatusBannerProps {
  status: AssignmentStatus;
  title: string;
  onDismiss?: () => void;
}

const CONFIG = {
  pending: {
    icon: Loader2,
    spin: true,
    bg: 'bg-amber-500/8 border-amber-500/15',
    text: 'text-amber-300',
    label: 'Queued',
    message: 'Your paper is in the queue and will start generating shortly.',
  },
  processing: {
    icon: Loader2,
    spin: true,
    bg: 'bg-blue-500/8 border-blue-500/15',
    text: 'text-blue-300',
    label: 'Generating',
    message: 'AI is generating your question paper. This takes 15–30 seconds.',
  },
  completed: {
    icon: CheckCircle,
    spin: false,
    bg: 'bg-green-500/8 border-green-500/15',
    text: 'text-green-300',
    label: 'Complete',
    message: 'Your question paper has been generated successfully.',
  },
  failed: {
    icon: AlertCircle,
    spin: false,
    bg: 'bg-red-500/8 border-red-500/15',
    text: 'text-red-300',
    label: 'Failed',
    message: 'Generation failed. Please try regenerating.',
  },
};

export function StatusBanner({ status, title, onDismiss }: StatusBannerProps) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;

  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-xl border', cfg.bg)}>
      <Icon size={15} className={clsx(cfg.text, cfg.spin && 'animate-spin')} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={clsx('text-[10px] font-bold uppercase tracking-wider', cfg.text)}>
            {cfg.label}
          </span>
          <span className="text-[10px] text-[#4d6077]">·</span>
          <span className="text-xs text-[#8a9bb5] truncate">{title}</span>
        </div>
        <p className="text-[11px] text-[#4d6077] mt-0.5">{cfg.message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-[#4d6077] hover:text-[#8a9bb5] transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
