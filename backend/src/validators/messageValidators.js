import { body } from 'express-validator';

export const createMessageValidator = [
  body('recipientId').trim().notEmpty().withMessage('Recipient is required'),
  body('body').trim().notEmpty().withMessage('Message body is required'),
];
