'use strict';

require('dotenv').config();

/**
 * Central application configuration.
 * All values are sourced from environment variables with safe defaults.
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/docx-converter',

  // CORS — comma-separated origins in .env
  allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim()),

  // Upload limits
  maxFileSizeBytes: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024,

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
  },

  // Puppeteer — useful for hosted environments
  puppeteer: {
    executablePath: process.env.CHROMIUM_PATH || undefined, // undefined = use bundled
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  },
};

module.exports = config;
