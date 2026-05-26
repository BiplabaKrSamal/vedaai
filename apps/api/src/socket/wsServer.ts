import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { WsEvent } from '@vedaai/shared';

let wss: WebSocketServer;

// Map of assignmentId → Set of connected clients
const roomMap = new Map<string, Set<WebSocket>>();
// All connected clients
const allClients = new Set<WebSocket>();

export function setupWebSocket(server: HttpServer): void {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WS client connected', req.socket.remoteAddress);
    allClients.add(ws);

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString()) as {
          type: string;
          assignmentId?: string;
        };

        // Client subscribes to a specific assignment
        if (msg.type === 'subscribe' && msg.assignmentId) {
          if (!roomMap.has(msg.assignmentId)) {
            roomMap.set(msg.assignmentId, new Set());
          }
          roomMap.get(msg.assignmentId)!.add(ws);
          ws.send(
            JSON.stringify({ type: 'subscribed', assignmentId: msg.assignmentId })
          );
        }
      } catch {
        // ignore malformed messages
      }
    });

    ws.on('close', () => {
      allClients.delete(ws);
      for (const [id, clients] of roomMap.entries()) {
        clients.delete(ws);
        if (clients.size === 0) roomMap.delete(id);
      }
    });

    ws.on('error', console.error);
  });

  console.log('🔌 WebSocket server initialized');
}

export function broadcastToAssignment(event: WsEvent): void {
  const clients = roomMap.get(event.assignmentId);
  if (!clients || clients.size === 0) return;

  const msg = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

export function broadcastToAll(event: WsEvent): void {
  const msg = JSON.stringify(event);
  for (const client of allClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}
