import { Router } from 'express';
import { createActivity, getActivities } from '../controllers/activityController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createActivityValidator } from '../validators/activityValidators.js';

export const activityRoutes = Router();

activityRoutes.use(requireAuth);
activityRoutes.get('/', getActivities);
activityRoutes.post('/', createActivityValidator, validate, createActivity);
