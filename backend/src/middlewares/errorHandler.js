import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';

export function notFoundHandler(req, res) {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    data: null,
  });
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error';
  let data = err.details || null;

  if (err?.code === 11000) {
    statusCode = StatusCodes.CONFLICT;
    message = 'A record with this unique value already exists';
    data = err.keyValue || null;
  }

  if (err?.name === 'ValidationError') {
    statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
    message = 'Validation failed';
    data = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  logger.error(
    {
      err,
      path: req.originalUrl,
      method: req.method,
    },
    err.message || 'Unhandled error'
  );

  res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}
