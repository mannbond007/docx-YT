'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/config');
const logger = require('./utils/logger');
const converterRoutes = require('./routes/converter.routes');
const { errorHandler } = require('./middleware/error.middleware');

const createApp = () => {
  const app = express();

  // ─── Security Headers ─────────────────────────────────────
  app.use(helmet());

  // ─── CORS Configuration ───────────────────────────────────
  const allowedOrigins = [
    "https://docx-yt.vercel.app",
    "http://localhost:5173"
  ];

  const corsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error(`CORS policy: origin "${origin}" is not allowed.`));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Disposition", "X-Conversion-Duration-Ms"],
    credentials: false,
  };

  app.use(cors(corsOptions));

  // VERY IMPORTANT → allow preflight
  app.options('*', cors(corsOptions));

  // ─── Body Parsing ─────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // ─── Request Logging ──────────────────────────────────────
  app.use((req, _res, next) => {
    logger.info(`→ ${req.method} ${req.originalUrl} [${req.ip}]`);
    next();
  });

  // ─── Health Check ─────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // ─── API Routes ───────────────────────────────────────────
  app.use('/api/v1', converterRoutes);

  // ─── 404 Handler ──────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });

  // ─── Centralized Error Handler ────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;