import { Router } from 'express';
import { performAiAction } from '../controllers/aiController.js';
import { requireAuth } from '../middlewares/auth.js';

export const aiRoutes = Router();

aiRoutes.use(requireAuth);
aiRoutes.post('/actions', performAiAction);
