'use client';

import { Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 px-4 py-2.5 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 border-b border-amber-500/20 text-xs print:hidden">
      <div className="flex items-center gap-2 text-amber-300">
        <Sparkles size={13} className="shrink-0 animate-pulse" />
        <span>
          <strong className="font-semibold">Demo Mode</strong>
          {' '}— Running with built-in question banks.{' '}
          <span className="text-amber-400/70">
            Set <code className="px-1 py-0.5 bg-amber-500/10 rounded text-amber-300 font-mono">ANTHROPIC_API_KEY</code> for live Claude AI generation.
          </span>
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 text-amber-400/50 hover:text-amber-300 transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  );
}
