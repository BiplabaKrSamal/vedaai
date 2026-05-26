import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('skeleton rounded-lg', className)} />;
}

export function AssignmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#1e2d3d] bg-[#161d27] p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="w-6 h-6 rounded-md" />
          <Skeleton className="h-4 flex-1 max-w-[60%]" />
        </div>
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="flex gap-3 ml-8">
        <Skeleton className="w-12 h-4 rounded-md" />
        <Skeleton className="w-16 h-4 rounded-md" />
        <Skeleton className="w-20 h-4 rounded-md" />
      </div>
      <div className="flex gap-1 ml-8">
        <Skeleton className="w-14 h-4 rounded" />
        <Skeleton className="w-14 h-4 rounded" />
        <Skeleton className="w-10 h-4 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[#1e2d3d] ml-8">
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-16 h-5 rounded-lg" />
      </div>
    </div>
  );
}

export function PaperSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
      {/* Header card */}
      <div className="bg-[#161d27] border border-[#2a3547] rounded-2xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-600 to-brand-400" />
        <div className="p-6 text-center space-y-3">
          <Skeleton className="h-3 w-32 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
          <Skeleton className="h-3 w-80 mx-auto" />
        </div>
        <div className="mx-6 mb-6 p-4 bg-[#0f141a] border border-[#2a3547] rounded-xl">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section */}
      {[...Array(2)].map((_, si) => (
        <div key={si} className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          {[...Array(3)].map((_, qi) => (
            <div key={qi} className="border border-[#2a3547] rounded-xl p-4 flex gap-3">
              <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <div className="flex gap-2 shrink-0">
                <Skeleton className="w-14 h-5 rounded-md" />
                <Skeleton className="w-10 h-5 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
