'use client';

import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import { registerToast } from '@/hooks/useWebSocket';

/**
 * Mounts inside ToastProvider and connects the WS toast bridge.
 * Place this once near the top of the app tree.
 */
export function ToastWsConnector() {
  const toast = useToast();

  useEffect(() => {
    registerToast((type, msg) => toast.toast(type, msg));
  }, [toast]);

  return null;
}
