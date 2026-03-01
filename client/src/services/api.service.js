/**
 * api.service.js
 * Axios service layer — all backend communication is centralised here.
 * The base URL is injected from the Vite environment variable.
 */
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 120_000, // 2 min — puppeteer can be slow on first cold start
});

/**
 * Sends a DOCX file to the backend conversion endpoint.
 *
 * @param {File} file - The .docx File object from the browser
 * @param {(progressEvent: import('axios').AxiosProgressEvent) => void} onUploadProgress
 * @returns {Promise<Blob>} - The PDF blob returned from the server
 */
export const convertFile = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await apiClient.post('/api/v1/convert', formData, {
    responseType: 'blob',          // receive PDF as binary Blob
    onUploadProgress,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export default apiClient;
