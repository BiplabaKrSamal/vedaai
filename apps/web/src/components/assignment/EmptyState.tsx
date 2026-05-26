'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';

export function EmptyState() {
  const { setShowCreateModal } = useAssignmentStore();

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-24 px-8 text-center">
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-2xl bg-[#1c2533] border border-[#2a3547] flex items-center justify-center mx-auto shadow-lg">
          {/* Paper stack illustration */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="8" y="14" width="28" height="28" rx="3" fill="#1e2d3d" stroke="#2a3547" strokeWidth="1.5"/>
            <rect x="12" y="10" width="28" height="28" rx="3" fill="#222d3d" stroke="#2a3547" strokeWidth="1.5"/>
            <rect x="16" y="6" width="28" height="28" rx="3" fill="#2a3547" stroke="#3a4557" strokeWidth="1.5"/>
            <path d="M20 18h14M20 23h14M20 28h9" stroke="#4d6077" strokeWidth="1.5" strokeLinecap="round"/>
            {/* X mark */}
            <circle cx="33" cy="8" r="7" fill="#161d27" stroke="#2a3547" strokeWidth="1.5"/>
            <path d="M30 5l6 6M36 5l-6 6" stroke="#e84c3a" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        {/* Glow */}
        <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-brand-500/5 blur-xl" />
      </div>

      <h2 className="text-lg font-semibold text-[#f0f4f8] mb-2">
        No assignments yet
      </h2>
      <p className="text-sm text-[#8a9bb5] max-w-xs mb-8 leading-relaxed">
        Create your first AI-powered question paper. Choose your subject, configure questions, and let AI do the rest.
      </p>

      <button
        onClick={() => setShowCreateModal(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/20 group"
      >
        <Sparkles size={15} />
        Create Assignment
        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
