'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * In-memory rate limiter for the /convert endpoint.
 * Limits each IP to config.rateLimit.max requests per windowMs.
 * No Redis or external store required.
 */
const convertLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,   // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,    // Disable the `X-RateLimit-*` headers

  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP ${req.ip}`);
    res.status(429).json({
      success: false,
      message: `Too many conversion requests. Please wait before trying again.`,
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000 / 60) + ' minutes',
    });
  },
});

module.exports = { convertLimiter };
