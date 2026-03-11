import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

export function validate(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    success: false,
    message: 'Validation failed',
    data: errors.array(),
  });
}
