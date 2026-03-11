import { Router } from 'express';
import { getSettings, updateCompanySettings, updateProfile } from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateProfileValidator } from '../validators/settingsValidators.js';

export const settingsRoutes = Router();

settingsRoutes.use(requireAuth);
settingsRoutes.get('/', getSettings);
settingsRoutes.patch('/profile', updateProfileValidator, validate, updateProfile);
settingsRoutes.patch('/company', requireRole('admin'), updateCompanySettings);
