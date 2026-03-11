import { body } from 'express-validator';
import { USER_ROLES } from '../utils/constants.js';

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(USER_ROLES).withMessage('Invalid role'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidator = [body('email').isEmail().withMessage('Valid email is required')];
export const resetPasswordValidator = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];
