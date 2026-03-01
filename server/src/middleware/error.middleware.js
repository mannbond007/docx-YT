'use strict';

const multer = require('multer');
const logger = require('../utils/logger');

/**
 * Centralized error-handling middleware.
 * Express recognizes this as an error handler because it has 4 parameters.
 *
 * Handled error types:
 *  - MulterError (file too large, unexpected field, etc.)
 *  - Custom errors with err.statusCode set by our middleware
 *  - Mongoose ValidationError
 *  - Generic 500 fallback
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Always log the full error for diagnostic purposes
  logger.error(`[${req.method} ${req.originalUrl}] ${err.message}`, {
    stack: err.stack,
    ip: req.ip,
  });

  // Multer-specific errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum allowed size is ${process.env.MAX_FILE_SIZE_MB || 10} MB.`,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Known application errors with an explicit statusCode
  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    success: false,
    message: err.message || 'An unexpected error occurred. Please try again.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler };
