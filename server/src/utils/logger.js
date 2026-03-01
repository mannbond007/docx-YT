'use strict';

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, colorize, printf, errors } = format;
const config = require('../config/config');

/**
 * Custom log line format:
 *   [2026-03-01 11:00:00] INFO  : message  { optional meta }
 */
const logFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `  ${JSON.stringify(meta)}` : '';
  return `[${ts}] ${level.toUpperCase().padEnd(5)}: ${stack || message}${metaStr}`;
});

const logger = createLogger({
  level: config.nodeEnv === 'production' ? 'warn' : 'debug',
  format: combine(
    errors({ stack: true }),   // captures Error stacks
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize({ all: true }),
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
  // Don't crash the process on unhandled logger errors
  exitOnError: false,
});

module.exports = logger;
