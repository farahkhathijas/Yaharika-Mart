import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { env } from './env';

let mongod: any = null;

export async function connectDB(): Promise<void> {
  try {
    mongoose.set('strictQuery', false);
    logger.info(`Attempting database connection to: ${env.MONGO_URI}`);
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.warn('MongoDB connection failed. Booting local in-memory MongoDB server fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      logger.info(`🚀 In-memory MongoDB connected: ${uri}`);

      // Programmatically run seed script
      const { seedDatabase } = await import('../seed/index');
      await seedDatabase();
      logger.info('🎉 In-memory database seeded successfully with mock neighborhood data.');
    } catch (memError) {
      logger.error('Failed to boot local in-memory MongoDB fallback:', memError);
      process.exit(1);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected.');
});
