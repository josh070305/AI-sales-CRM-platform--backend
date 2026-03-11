import { body } from 'express-validator';
import { ACTIVITY_TYPES } from '../utils/constants.js';

export const createActivityValidator = [
  body('type').isIn(ACTIVITY_TYPES).withMessage('Invalid activity type'),
  body('content').trim().notEmpty().withMessage('Content is required'),
];
