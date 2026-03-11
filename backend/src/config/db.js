import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed');
    process.exit(1);
  }
}
