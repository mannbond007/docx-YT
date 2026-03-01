/**
 * DownloadButton.jsx
 * Rendered only when conversion is complete.
 * Uses a native <a> with download attribute to trigger the PDF download.
 */

/**
 * @param {{ href: string, fileName: string, onReset: () => void }} props
 */
const DownloadButton = ({ href, fileName, onReset }) => (
  <div className="download-section">
    <a
      id="download-btn"
      href={href}
      download={fileName}
      className="btn btn--primary"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Download PDF
    </a>

    <button
      id="convert-another-btn"
      onClick={onReset}
      className="btn btn--ghost"
      type="button"
    >
      Convert another file
    </button>
  </div>
);

export default DownloadButton;
