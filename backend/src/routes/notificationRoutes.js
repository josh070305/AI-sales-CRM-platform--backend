import { Router } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationsAsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middlewares/auth.js';

export const notificationRoutes = Router();

notificationRoutes.use(requireAuth);
notificationRoutes.get('/', getNotifications);
notificationRoutes.patch('/read-all', markNotificationsAsRead);
notificationRoutes.patch('/:id/read', markNotificationAsRead);
