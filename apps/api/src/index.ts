import 'dotenv/config';
import http from 'http';
import app from './app';
import { setupWebSocket } from './socket/wsServer';
import { connectDB } from './services/db';
import { connectRedis } from './services/redis';
import { startWorker } from './workers/generationWorker';

const PORT = process.env.PORT || 4000;

async function main() {
  await connectDB();
  await connectRedis();

  const server = http.createServer(app);
  setupWebSocket(server);
  await startWorker();

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n🚀 VedaAI API running on http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket ready on ws://0.0.0.0:${PORT}`);
    console.log(`🎭 Mode: ${process.env.ANTHROPIC_API_KEY === 'demo' || !process.env.ANTHROPIC_API_KEY ? 'DEMO' : 'PRODUCTION'}`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
