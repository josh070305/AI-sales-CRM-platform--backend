import { body } from 'express-validator';

export const updateProfileValidator = [
  body('name').optional().trim().notEmpty(),
  body('phoneNumber').optional().isString(),
  body('themePreference').optional().isIn(['light', 'dark', 'system']),
];
