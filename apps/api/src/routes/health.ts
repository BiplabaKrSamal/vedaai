import { Router } from 'express';
import mongoose from 'mongoose';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  const isDemo = !process.env.MONGODB_URI || process.env.MONGODB_URI === 'demo';
  res.json({
    status: 'ok',
    mode: isDemo ? 'demo' : 'production',
    db: isDemo ? 'in-memory' : (mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'),
    timestamp: new Date().toISOString(),
  });
});
