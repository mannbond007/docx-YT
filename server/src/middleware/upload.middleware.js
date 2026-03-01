'use strict';

const multer = require('multer');
const config = require('../config/config');

/**
 * Multer memory-storage middleware.
 * - Keeps files in RAM (Buffer) — no disk I/O.
 * - Accepts a single field named "document".
 * - Enforces max file size from config.
 * - Pre-filter: only allows files with the .docx mimetype.
 */
const fileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword', // fallback for older browsers
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Only .docx files are accepted.');
    err.statusCode = 415;
    cb(err, false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSizeBytes },
  fileFilter,
});

/**
 * Exported as a middleware factory so calling code picks the field name.
 * Usage: uploadMiddleware.single('document')
 */
module.exports = upload;
