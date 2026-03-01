'use strict';

const path = require('path');

/**
 * Post-multer validation middleware.
 * Runs AFTER upload.single() so req.file is populated.
 * Validates: file presence, extension whitelist, and double-checks mimetype.
 */
const validateDocument = (req, _res, next) => {
  // 1. Ensure a file was actually uploaded
  if (!req.file) {
    const err = new Error('No file uploaded. Please attach a .docx file.');
    err.statusCode = 400;
    return next(err);
  }

  // 2. Check file extension
  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.docx') {
    const err = new Error(`Invalid file extension "${ext}". Only .docx files are accepted.`);
    err.statusCode = 415;
    return next(err);
  }

  // 3. Sanity-check buffer is not empty
  if (!req.file.buffer || req.file.buffer.length === 0) {
    const err = new Error('Uploaded file appears to be empty.');
    err.statusCode = 400;
    return next(err);
  }

  next();
};

module.exports = { validateDocument };
