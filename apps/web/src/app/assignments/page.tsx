'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, SlidersHorizontal, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AssignmentCard } from '@/components/assignment/AssignmentCard';
import { EmptyState } from '@/components/assignment/EmptyState';
import { CreateAssignmentModal } from '@/components/assignment/CreateAssignmentModal';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastWsConnector } from '@/components/ui/ToastWsConnector';
import type { AssignmentStatus } from '@vedaai/shared';

const STATUS_TABS: { label: string; value: AssignmentStatus | 'all' }[] = [
  { label: 'All',        value: 'all'        },
  { label: 'Completed',  value: 'completed'  },
  { label: 'Processing', value: 'processing' },
  { label: 'Pending',    value: 'pending'    },
  { label: 'Failed',     value: 'failed'     },
];

const DIFF_OPTS = ['all', 'easy', 'medium', 'hard'] as const;

export default function AssignmentsPage() {
  const {
    assignments, isLoading,
    showCreateModal, setShowCreateModal,
    fetchAssignments,
  } = useAssignmentStore();

  useWebSocket();

  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
  const [diffFilter,   setDiffFilter]   = useState<string>('all');

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const filtered = assignments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.input.title.toLowerCase().includes(q) ||
      a.input.subject.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchDiff   = diffFilter   === 'all' || a.input.difficulty === diffFilter;
    return matchSearch && matchStatus && matchDiff;
  });

  return (
    <div className="flex h-screen bg-[#0f141a] overflow-hidden">
      <ToastWsConnector />
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d3d] shrink-0">
          <div>
            <h1 className="text-base font-semibold text-[#f0f4f8]">Assignments</h1>
            <p className="text-xs text-[#4d6077]">{assignments.length} total</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-brand-500/20"
          >
            <Plus size={14} /> New Assignment
          </button>
        </header>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-[#1e2d3d] space-y-2.5 shrink-0">
          <div className="flex items-center gap-2.5">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6077]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or subject…"
                className="w-full pl-8 pr-3 py-2 bg-[#161d27] border border-[#2a3547] rounded-lg text-xs text-[#f0f4f8] placeholder-[#4d6077] focus:outline-none focus:border-brand-500/50"
              />
            </div>
            {/* Difficulty chips */}
            <div className="flex items-center gap-1">
              <SlidersHorizontal size={12} className="text-[#4d6077] mr-1" />
              {DIFF_OPTS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className={clsx(
                    'px-2.5 py-1 rounded-md text-[10px] font-medium capitalize transition-colors',
                    diffFilter === d
                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                      : 'text-[#4d6077] hover:text-[#8a9bb5] border border-transparent',
                  )}
                >
                  {d === 'all' ? 'All Levels' : d}
                </button>
              ))}
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex items-center gap-0.5">
            {STATUS_TABS.map((tab) => {
              const cnt = tab.value === 'all'
                ? assignments.length
                : assignments.filter((a) => a.status === tab.value).length;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    statusFilter === tab.value
                      ? 'bg-[#1c2533] text-[#f0f4f8] border border-[#2a3547]'
                      : 'text-[#4d6077] hover:text-[#8a9bb5]',
                  )}
                >
                  {tab.label}
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded text-[9px] font-bold',
                    statusFilter === tab.value ? 'bg-[#2a3547] text-[#8a9bb5]' : 'text-[#2a3547]',
                  )}>
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 rounded-xl skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            assignments.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Filter size={28} className="text-[#2a3547] mb-4" />
                <p className="text-sm text-[#8a9bb5] mb-3">No assignments match your filters</p>
                <button
                  onClick={() => { setSearch(''); setStatusFilter('all'); setDiffFilter('all'); }}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )
          ) : (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-[fadeIn_.3s_ease-out]">
              {filtered.map((a) => (
                <AssignmentCard
                  key={a._id}
                  assignment={a}
                  onClick={() => {
                    if (a.status === 'completed') {
                      window.location.href = `/assignments/${a._id}`;
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && <CreateAssignmentModal />}
    </div>
  );
}
