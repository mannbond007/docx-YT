'use strict';

const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload.middleware');
const { validateDocument } = require('../middleware/validate.middleware');
const { convertLimiter } = require('../middleware/rateLimit.middleware');
const { convertDocument } = require('../controllers/converter.controller');

/**
 * POST /api/v1/convert
 *
 * Middleware chain (left to right):
 *   convertLimiter  → enforce rate limit per IP (returns 429 if exceeded)
 *   upload.single   → parse multipart body, buffer the file in-memory
 *   validateDocument→ verify extension, buffer integrity
 *   convertDocument → run conversion pipeline, stream PDF back
 */
router.post(
  '/convert',
  convertLimiter,
  upload.single('document'),
  validateDocument,
  convertDocument
);

module.exports = router;
