import { body } from 'express-validator';
import { LEAD_PRIORITIES, LEAD_STATUSES } from '../utils/constants.js';

export const createLeadValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phoneNumber').optional().isString(),
  body('company').trim().notEmpty().withMessage('Company is required'),
  body('status').optional().isIn(LEAD_STATUSES),
  body('priority').optional().isIn(LEAD_PRIORITIES),
];

export const updateLeadValidator = [
  body('fullName').optional().trim().notEmpty(),
  body('email').optional().isEmail(),
  body('status').optional().isIn(LEAD_STATUSES),
  body('priority').optional().isIn(LEAD_PRIORITIES),
];
