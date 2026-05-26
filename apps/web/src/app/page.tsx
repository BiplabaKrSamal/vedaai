'use client';

import { useEffect } from 'react';
import { Plus, Search, Bell, Sparkles, CheckCircle, Clock, BookOpen } from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AssignmentCard } from '@/components/assignment/AssignmentCard';
import { EmptyState } from '@/components/assignment/EmptyState';
import { CreateAssignmentModal } from '@/components/assignment/CreateAssignmentModal';
import { Sidebar } from '@/components/layout/Sidebar';
import { ToastWsConnector } from '@/components/ui/ToastWsConnector';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="bg-[#161d27] border border-[#2a3547] rounded-xl p-5 hover:border-[#3a4557] transition-colors">
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${accent}`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-2xl font-bold text-[#f0f4f8] tabular-nums">{value}</p>
      <p className="text-xs text-[#8a9bb5] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[#4d6077] mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const {
    assignments,
    isLoading,
    showCreateModal,
    setShowCreateModal,
    fetchAssignments,
  } = useAssignmentStore();

  useWebSocket();

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const stats = {
    total: assignments.length,
    completed: assignments.filter((a) => a.status === 'completed').length,
    inProgress: assignments.filter(
      (a) => a.status === 'processing' || a.status === 'pending'
    ).length,
  };

  const recent = assignments.slice(0, 6);

  return (
    <div className="flex h-screen bg-[#0f141a] overflow-hidden">
      <ToastWsConnector />
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1e2d3d] bg-[#0f141a] shrink-0">
          <div>
            <h1 className="text-base font-semibold text-[#f0f4f8]">Dashboard</h1>
            <p className="text-xs text-[#4d6077]">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="relative hidden md:block">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d6077]"
              />
              <input
                type="text"
                placeholder="Search assignments..."
                className="pl-8 pr-4 py-2 bg-[#161d27] border border-[#2a3547] rounded-lg text-xs text-[#f0f4f8] placeholder-[#4d6077] focus:outline-none focus:border-brand-500/50 w-52 transition-colors"
              />
            </div>
            <button className="relative w-8 h-8 rounded-lg bg-[#161d27] border border-[#2a3547] flex items-center justify-center text-[#8a9bb5] hover:text-[#f0f4f8] hover:bg-[#1c2533] transition-colors">
              <Bell size={14} />
              {stats.inProgress > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {stats.inProgress}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-brand-500/25"
            >
              <Plus size={14} />
              New Assignment
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                <p className="text-xs text-[#4d6077]">Loading…</p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="px-6 py-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  icon={BookOpen}
                  label="Total Assignments"
                  value={stats.total}
                  sub="All time"
                  accent="bg-brand-500"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Completed"
                  value={stats.completed}
                  sub="Ready to distribute"
                  accent="bg-emerald-600"
                />
                <StatCard
                  icon={Clock}
                  label="In Progress"
                  value={stats.inProgress}
                  sub={stats.inProgress > 0 ? 'AI generating…' : 'Nothing pending'}
                  accent="bg-blue-600"
                />
              </div>

              {/* Recent assignments */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-[#f0f4f8]">
                    Recent Assignments
                  </h2>
                  <a
                    href="/assignments"
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    View all →
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recent.map((a) => (
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
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && <CreateAssignmentModal />}
    </div>
  );
}
