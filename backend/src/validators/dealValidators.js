import { body } from 'express-validator';
import { DEAL_STAGES } from '../utils/constants.js';

export const createDealValidator = [
  body('title').trim().notEmpty().withMessage('Deal title is required'),
  body('lead').trim().notEmpty().withMessage('Lead is required'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('assignedTo').trim().notEmpty().withMessage('Assigned user is required'),
];

export const updateDealValidator = [
  body('stage').optional().isIn(DEAL_STAGES),
  body('estimatedAmount').optional().isNumeric(),
  body('probability').optional().isInt({ min: 0, max: 100 }),
];
