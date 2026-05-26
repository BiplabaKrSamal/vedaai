'use client';

import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string, duration?: number) => string;
  dismiss: (id: string) => void;
  success: (msg: string) => string;
  error: (msg: string) => string;
  info: (msg: string) => string;
  loading: (msg: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  loading: Loader2,
};

const COLORS = {
  success: 'text-green-400 bg-green-500/10 border-green-500/20',
  error: 'text-red-400 bg-red-500/10 border-red-500/20',
  info: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  loading: 'text-brand-400 bg-brand-500/10 border-brand-500/20',
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[toast.type];

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true));

    if (toast.type !== 'loading' && toast.duration !== 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300);
      }, toast.duration ?? 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, toast.type, onDismiss]);

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300',
        'bg-[#161d27] max-w-sm w-full',
        COLORS[toast.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      <Icon
        size={16}
        className={clsx('shrink-0', toast.type === 'loading' && 'animate-spin')}
      />
      <p className="text-xs font-medium text-[#f0f4f8] flex-1">{toast.message}</p>
      {toast.type !== 'loading' && (
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          className="text-[#4d6077] hover:text-[#8a9bb5] transition-colors"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, duration?: number): string => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = {
    toast,
    dismiss,
    success: (msg) => toast('success', msg),
    error: (msg) => toast('error', msg),
    info: (msg) => toast('info', msg),
    loading: (msg) => toast('loading', msg),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Portal */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
