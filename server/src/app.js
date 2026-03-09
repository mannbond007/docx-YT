'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const converterRoutes = require('./routes/converter.routes');
const { errorHandler } = require('./middleware/error.middleware');

const createApp = () => {
  const app = express();

  // Security
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: [
      "https://docx-yt.vercel.app",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: "ok" });
  });

  // API routes
  app.use('/api/v1', converterRoutes);

  // 404
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};

module.exports = createApp;