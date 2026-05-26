import 'dotenv/config';
import http from 'http';
import app from './app';
import { setupWebSocket } from './socket/wsServer';
import { connectDB } from './services/db';
import { connectRedis } from './services/redis';
import { startWorker } from './workers/generationWorker';

const PORT = process.env.PORT || 4000;

async function main() {
  // Connect services
  await connectDB();
  await connectRedis();

  // Create HTTP server (shared with WS)
  const server = http.createServer(app);

  // Setup WebSocket
  setupWebSocket(server);

  // Start BullMQ worker
  startWorker();

  server.listen(PORT, () => {
    console.log(`\n🚀 VedaAI API running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
