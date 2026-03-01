'use strict';

const path = require('path');
const converterService = require('../services/converter.service');
const ConversionLog = require('../models/ConversionLog.model');
const logger = require('../utils/logger');

/**
 * POST /api/v1/convert
 *
 * Orchestrates the full DOCX→PDF pipeline:
 *   1. Read file buffer from multer (memory storage)
 *   2. Convert DOCX → HTML via mammoth
 *   3. Wrap HTML in styled document template
 *   4. Render HTML → PDF via puppeteer
 *   5. Stream PDF back to client
 *   6. Persist audit log to MongoDB (non-blocking)
 */
const convertDocument = async (req, res, next) => {
  const startTime = Date.now();
  const { originalname, buffer, size } = req.file;
  const clientIp = req.ip || req.socket?.remoteAddress || 'unknown';

  // Derive a clean base name for the output PDF
  const baseName = path.basename(originalname, path.extname(originalname));
  const outputFileName = `${baseName}.pdf`;

  logger.info(`Conversion request received: "${originalname}" (${size} bytes) from ${clientIp}`);

  let success = false;
  let errorMessage = null;

  try {
    // Step 1: DOCX → HTML
    const html = await converterService.convertDocxToHtml(buffer);

    // Step 2: Wrap in styled full-page document
    const styledDocument = converterService.buildStyledDocument(html, baseName);

    // Step 3: HTML → PDF
    const pdfBuffer = await converterService.convertHtmlToPdf(styledDocument);

    success = true;
    const durationMs = Date.now() - startTime;
    logger.info(`Conversion successful for "${originalname}" in ${durationMs}ms`);

    // Step 4: Set response headers and send PDF buffer
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${outputFileName}"`,
      'Content-Length': pdfBuffer.length,
      'X-Conversion-Duration-Ms': durationMs,
    });

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    errorMessage = err.message;
    logger.error(`Conversion failed for "${originalname}": ${err.message}`);
    return next(err);
  } finally {
    // Audit log — fire and forget; never block the response
    ConversionLog.create({
      originalName: originalname,
      sizeBytes: size,
      success,
      errorMessage,
      ip: clientIp,
      durationMs: Date.now() - startTime,
    }).catch((dbErr) => {
      logger.warn(`Failed to write conversion log: ${dbErr.message}`);
    });
  }
};

module.exports = { convertDocument };
