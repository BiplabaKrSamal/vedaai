import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  // Demo mode: use in-memory MongoDB via mongodb-memory-server
  if (!uri || uri === 'demo') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log('✅ MongoDB (in-memory) connected — demo mode');
    return;
  }

  await mongoose.connect(uri);
  console.log('✅ MongoDB connected');
}
