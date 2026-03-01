'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const createApp = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/utils/logger');

const app = createApp();

/**
 * Graceful shutdown handler.
 * Closes the MongoDB connection before exiting.
 */
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received — initiating graceful shutdown`);
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});

/**
 * Connect to MongoDB, then start the HTTP server.
 * MongoDB is optional at startup — conversion still works even if Mongo is down
 * (audit logging will silently fail, which is acceptable).
 */
const start = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // fail fast if Mongo is unreachable
    });
    logger.info(`MongoDB connected: ${config.mongoUri}`);
  } catch (err) {
    logger.warn(`MongoDB not available — audit logging disabled: ${err.message}`);
  }

  app.listen(config.port, () => {
    logger.info(`────────────────────────────────────────────────`);
    logger.info(` DocxConverter API running on port ${config.port}`);
    logger.info(` Environment: ${config.nodeEnv}`);
    logger.info(` Endpoint: POST http://localhost:${config.port}/api/v1/convert`);
    logger.info(`────────────────────────────────────────────────`);
  });
};

start();
