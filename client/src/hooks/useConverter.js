/**
 * useConverter.js
 * Custom hook encapsulating all DOCX→PDF conversion state and logic.
 * Keeps ConverterPage clean by abstracting file handling, API calls,
 * progress tracking, and download URL management.
 */
import { useState, useCallback, useRef } from 'react';
import { convertFile } from '../services/api.service';

/**
 * @typedef {'idle' | 'uploading' | 'converting' | 'done' | 'error'} ConversionStatus
 */

const useConverter = () => {
  const [status, setStatus] = useState(/** @type {ConversionStatus} */ ('idle'));
  const [progress, setProgress] = useState(0);       // 0–100 upload progress
  const [error, setError] = useState(null);           // Error message string
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState(null);     // Output PDF filename

  /** Keep track of the previous object URL so we can revoke it */
  const prevUrlRef = useRef(null);

  /**
   * Starts the conversion pipeline for a given File.
   * @param {File} file
   */
  const convert = useCallback(async (file) => {
    // Clean up previous download URL to avoid memory leaks
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }

    setStatus('uploading');
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
    setFileName(null);

    try {
      const pdfBlob = await convertFile(file, (progressEvent) => {
        if (progressEvent.total) {
          const pct = Math.round((progressEvent.loaded / progressEvent.total) * 100);
          setProgress(pct);
        }

        // Once upload finishes (100%), switch status to "converting"
        // so the user knows the server is working
        if (progressEvent.loaded === progressEvent.total) {
          setStatus('converting');
        }
      });

      // Create a temporary download URL from the blob
      const url = URL.createObjectURL(pdfBlob);
      prevUrlRef.current = url;

      // Derive output filename from original filename
      const baseName = file.name.replace(/\.docx$/i, '');
      setFileName(`${baseName}.pdf`);
      setDownloadUrl(url);
      setStatus('done');
    } catch (err) {
      // Try to extract a meaningful message from the server response
      let message = 'Conversion failed. Please try again.';
      if (err.response) {
        try {
          // Server returned a JSON error body (as a Blob since responseType=blob)
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          message = json.message || message;
        } catch {
          message = `Server error: ${err.response.status}`;
        }
      } else if (err.request) {
        message = 'Cannot reach the server. Check your connection.';
      }
      setError(message);
      setStatus('error');
    }
  }, []);

  /** Resets all state back to idle so the user can convert another file */
  const reset = useCallback(() => {
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    setStatus('idle');
    setProgress(0);
    setError(null);
    setDownloadUrl(null);
    setFileName(null);
  }, []);

  return { status, progress, error, downloadUrl, fileName, convert, reset };
};

export default useConverter;
