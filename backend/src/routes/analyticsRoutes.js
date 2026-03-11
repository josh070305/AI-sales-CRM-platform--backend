import { Router } from 'express';
import { getAnalytics, getDashboard, getTeamAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth);
analyticsRoutes.get('/dashboard', getDashboard);
analyticsRoutes.get('/', requireRole('admin', 'sales_manager'), getAnalytics);
analyticsRoutes.get('/team', requireRole('admin', 'sales_manager'), getTeamAnalytics);
