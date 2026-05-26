'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { WsEvent } from '@vedaai/shared';
import { useAssignmentStore } from '@/store/assignmentStore';
import { api } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/ws';

// Toast callback type — injected so this hook stays decoupled from context
type ToastFn = (type: 'success' | 'error' | 'info' | 'loading', msg: string) => string;

let _toastFn: ToastFn | null = null;
export function registerToast(fn: ToastFn) {
  _toastFn = fn;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);
  const isConnecting = useRef(false);

  // Use a ref for assignments to avoid stale closure in reconnect
  const assignmentsRef = useRef(useAssignmentStore.getState().assignments);
  useEffect(() => {
    return useAssignmentStore.subscribe((state) => {
      assignmentsRef.current = state.assignments;
    });
  }, []);

  const { updateAssignmentStatus } = useAssignmentStore();

  const subscribeToAssignment = useCallback((assignmentId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: 'subscribe', assignmentId })
      );
    }
  }, []);

  const connect = useCallback(() => {
    if (
      isConnecting.current ||
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) return;

    isConnecting.current = true;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      isConnecting.current = false;
      console.log('🔌 WebSocket connected');

      // Re-subscribe all in-flight assignments
      const pending = assignmentsRef.current.filter(
        (a) => a.status === 'pending' || a.status === 'processing'
      );
      for (const a of pending) {
        ws.send(JSON.stringify({ type: 'subscribe', assignmentId: a._id }));
      }
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data as string) as WsEvent;

        // Find the assignment title for human-readable toasts
        const assignment = assignmentsRef.current.find(
          (a) => a._id === msg.assignmentId
        );
        const title = assignment?.input?.title ?? 'Assignment';

        switch (msg.type) {
          case 'job:queued':
            updateAssignmentStatus(msg.assignmentId, 'pending');
            _toastFn?.('info', `"${title}" is queued for generation`);
            break;

          case 'job:processing':
            updateAssignmentStatus(msg.assignmentId, 'processing');
            _toastFn?.('loading', `Generating "${title}"...`);
            break;

          case 'job:completed': {
            const updated = await api.getAssignment(msg.assignmentId);
            updateAssignmentStatus(msg.assignmentId, 'completed', updated.paper);
            _toastFn?.('success', `"${title}" is ready!`);
            break;
          }

          case 'job:failed':
            updateAssignmentStatus(msg.assignmentId, 'failed');
            _toastFn?.('error', `"${title}" failed. Try regenerating.`);
            break;
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      isConnecting.current = false;
      console.log('WebSocket disconnected, reconnecting in 3s…');
      reconnectTimer.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      isConnecting.current = false;
      ws.close();
    };
  }, [updateAssignmentStatus]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { subscribeToAssignment };
}
