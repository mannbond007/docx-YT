'use strict';

const mammoth = require('mammoth');
const puppeteer = require('puppeteer');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * Converts a DOCX buffer to an HTML string using mammoth.
 *
 * @param {Buffer} buffer - Raw DOCX file buffer from multer (memory storage)
 * @returns {Promise<string>} - HTML string
 */
const convertDocxToHtml = async (buffer) => {
  logger.info('Starting DOCX → HTML conversion with mammoth');
  const result = await mammoth.convertToHtml({ buffer });

  if (result.messages && result.messages.length > 0) {
    result.messages.forEach((msg) => {
      logger.warn(`Mammoth warning: ${msg.message}`);
    });
  }

  if (!result.value) {
    throw Object.assign(new Error('DOCX conversion produced no content.'), { statusCode: 422 });
  }

  logger.info('DOCX → HTML conversion successful');
  return result.value;
};

/**
 * Wraps raw HTML in a full styled page document suitable for PDF rendering.
 *
 * @param {string} bodyHtml - Inner HTML from mammoth
 * @param {string} originalName - Used as the document title
 * @returns {string} - Full HTML document
 */
const buildStyledDocument = (bodyHtml, originalName) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${originalName}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    @page { margin: 2.5cm 2cm; }
    body {
      font-family: 'Segoe UI', Calibri, Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
    }
    h1, h2, h3, h4, h5, h6 { font-weight: 600; margin: 1.2em 0 0.4em; }
    h1  { font-size: 2em;   border-bottom: 2px solid #333; padding-bottom: 0.2em; }
    h2  { font-size: 1.6em; border-bottom: 1px solid #ccc; padding-bottom: 0.1em; }
    p   { margin: 0 0 0.8em; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
    th, td { border: 1px solid #bbb; padding: 8px 12px; text-align: left; }
    th  { background: #f0f0f0; font-weight: 600; }
    img { max-width: 100%; height: auto; display: block; margin: 0.5em auto; }
    pre, code { font-family: 'Courier New', monospace; font-size: 10pt; background: #f6f6f6; padding: 2px 4px; border-radius: 3px; }
    pre { padding: 1em; overflow-x: auto; }
    ul, ol { margin: 0 0 0.8em 1.5em; }
    a   { color: #2563eb; }
    blockquote { border-left: 4px solid #cbd5e1; margin: 0; padding: 0.5em 1em; color: #555; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;

/**
 * Converts an HTML string to a PDF Buffer using headless Chromium (puppeteer).
 * Always closes the browser in the finally block to prevent memory leaks.
 *
 * @param {string} html - Full HTML document string
 * @returns {Promise<Buffer>} - PDF binary buffer
 */
const convertHtmlToPdf = async (html) => {
  logger.info('Launching headless Chromium for HTML → PDF conversion');

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: config.puppeteer.executablePath,
    args: config.puppeteer.args,
  });

  try {
    const page = await browser.newPage();

    // Set content and wait until all network requests settle
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '2.5cm', right: '2cm', bottom: '2.5cm', left: '2cm' },
    });

    logger.info(`HTML → PDF conversion complete. PDF size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } finally {
    // CRITICAL: always close browser to free Chromium processes
    await browser.close();
    logger.info('Chromium browser closed');
  }
};

module.exports = { convertDocxToHtml, convertHtmlToPdf, buildStyledDocument };
