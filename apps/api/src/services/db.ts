import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'demo') {
    console.log('✅ MongoDB skipped — using in-memory store (demo mode)');
    return;
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}
