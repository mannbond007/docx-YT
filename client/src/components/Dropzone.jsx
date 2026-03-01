/**
 * Dropzone.jsx
 * Drag-and-drop file input that accepts only .docx files.
 * Validates file type BEFORE triggering onFile callback.
 */
import { useState, useRef, useCallback } from "react";
import { formatFileSize } from "../utils/formatFileSize";

const ACCEPTED_MIME = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

/**
 * @param {{ onFile: (file: File) => void, disabled: boolean }} props
 */
const Dropzone = ({ onFile, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [clientError, setClientError] = useState(null);
  const inputRef = useRef(null);

  const validate = (file) => {
    setClientError(null);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "docx" && !ACCEPTED_MIME.includes(file.type)) {
      setClientError(
        `"${file.name}" is not a .docx file. Only Word documents are accepted.`,
      );
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      setClientError(
        `File exceeds the 10 MB limit (${formatFileSize(file.size)}).`,
      );
      return false;
    }
    return true;
  };

  const handleFile = useCallback(
    (file) => {
      if (!file || disabled) return;
      if (validate(file)) onFile(file);
    },
    [onFile, disabled],
  );

  /* ── Drag events ─────────────────────────────────────────────────────── */
  const onDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  /* ── Input click ─────────────────────────────────────────────────────── */
  const onInputChange = (e) => handleFile(e.target.files?.[0]);
  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="dropzone-wrapper">
      <div
        id="dropzone"
        className={`dropzone ${isDragging ? "dropzone--active" : ""} ${disabled ? "dropzone--disabled" : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={onClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Click or drag a .docx file to upload"
        onKeyDown={(e) => e.key === "Enter" && onClick()}
      >
        {/* Upload Icon */}
        <div className="dropzone__icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="dropzone__title">
          {isDragging ? "Release to upload" : "Drop your DOCX file here"}
        </p>
        <p className="dropzone__sub">
          or <span className="dropzone__link">browse files</span>
        </p>
        <p className="dropzone__hint">Supports .docx · Max 10 MB</p>

        <input
          ref={inputRef}
          id="file-input"
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: "none" }}
          onChange={onInputChange}
          disabled={disabled}
        />
      </div>

      {clientError && (
        <div className="dropzone__error" role="alert">
          <span>⚠ {clientError}</span>
        </div>
      )}
    </div>
  );
};

export default Dropzone;
