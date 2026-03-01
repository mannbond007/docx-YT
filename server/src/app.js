'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const converterRoutes = require('./routes/converter.routes');
const { errorHandler } = require('./middleware/error.middleware');

/**
 * Creates and configures the Express application.
 * Separated from server.js to allow clean unit testing.
 */
const createApp = () => {
  const app = express();

  // ─── Security Headers ───────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ───────────────────────────────────────────────────────────────────
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, same-origin)
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
      }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'X-Conversion-Duration-Ms'],
    credentials: false,
  };
  app.use(cors(corsOptions));

  // ─── Body Parsing ────────────────────────────────────────────────────────────
  // Note: multer handles multipart/form-data; these parsers handle JSON/URL-encoded
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // ─── Request Logging ────────────────────────────────────────────────────────
  app.use((req, _res, next) => {
    logger.info(`→ ${req.method} ${req.originalUrl} [${req.ip}]`);
    next();
  });

  // ─── Health Check ────────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // ─── API Routes ──────────────────────────────────────────────────────────────
  app.use('/api/v1', converterRoutes);

  // ─── 404 Handler ────────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // ─── Centralized Error Handler (must be last) ────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
