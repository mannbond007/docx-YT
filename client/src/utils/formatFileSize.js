/**
 * formatFileSize.js
 * Utility to display human-readable file sizes.
 */

/**
 * @param {number} bytes
 * @returns {string} e.g. "3.2 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
