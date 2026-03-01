'use strict';

const mongoose = require('mongoose');

/**
 * ConversionLog — audit trail for every conversion attempt.
 * Stored in MongoDB; does NOT hold any file binary data.
 */
const conversionLogSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    sizeBytes: {
      type: Number,
      required: true,
    },
    success: {
      type: Boolean,
      required: true,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: 'unknown',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    versionKey: false,
  }
);

// Index for analytics queries
conversionLogSchema.index({ createdAt: -1 });
conversionLogSchema.index({ success: 1, createdAt: -1 });

module.exports = mongoose.model('ConversionLog', conversionLogSchema);
