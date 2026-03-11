import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { authRoutes } from './routes/authRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { leadRoutes } from './routes/leadRoutes.js';
import { dealRoutes } from './routes/dealRoutes.js';
import { activityRoutes } from './routes/activityRoutes.js';
import { notificationRoutes } from './routes/notificationRoutes.js';
import { messageRoutes } from './routes/messageRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import { aiRoutes } from './routes/aiRoutes.js';
import { settingsRoutes } from './routes/settingsRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'AI Sales CRM backend is healthy', data: null });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/leads', leadRoutes);
  app.use('/api/deals', dealRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/settings', settingsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
