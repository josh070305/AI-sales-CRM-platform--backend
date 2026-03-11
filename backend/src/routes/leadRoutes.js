import { Router } from 'express';
import {
  convertLeadToDeal,
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLead,
} from '../controllers/leadController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createLeadValidator, updateLeadValidator } from '../validators/leadValidators.js';

export const leadRoutes = Router();

leadRoutes.use(requireAuth);
leadRoutes.get('/', getLeads);
leadRoutes.get('/:id', getLeadById);
leadRoutes.post('/', createLeadValidator, validate, createLead);
leadRoutes.patch('/:id', updateLeadValidator, validate, updateLead);
leadRoutes.delete('/:id', requireRole('admin', 'sales_manager'), deleteLead);
leadRoutes.post('/:id/convert', convertLeadToDeal);
