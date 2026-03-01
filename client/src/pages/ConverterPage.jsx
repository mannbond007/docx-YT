/**
 * ConverterPage.jsx
 * Main application page. Composes all components and wires useConverter hook.
 */
import { useCallback } from "react";
import useConverter from "../hooks/useConverter";
import Dropzone from "../components/Dropzone";
import ProgressBar from "../components/ProgressBar";
import StatusCard from "../components/StatusCard";
import DownloadButton from "../components/DownloadButton";
import { formatFileSize } from "../utils/formatFileSize";

const ConverterPage = () => {
  const { status, progress, error, downloadUrl, fileName, convert, reset } =
    useConverter();

  const isActive = status === "uploading" || status === "converting";

  const handleFile = useCallback(
    (file) => {
      convert(file);
    },
    [convert],
  );

  return (
    <main className="page">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header className="hero">
        <div className="hero__badge">Free · Fast · Secure</div>
        <h1 className="hero__title">
          DOCX <span className="hero__arrow">→</span> PDF
        </h1>
        <p className="hero__subtitle">
          Convert Word documents to high-quality PDFs instantly — no uploads to
          third-party servers, no watermarks, no email required.
        </p>
      </header>

      {/* ── Converter Card ─────────────────────────────────────────── */}
      <section className="card" aria-label="Converter">
        {/* Show dropzone only when idle or after an error (allow retry) */}
        {(status === "idle" || status === "error") && (
          <Dropzone onFile={handleFile} disabled={isActive} />
        )}

        {/* Status feedback */}
        {status !== "idle" && (
          <StatusCard status={status} errorMessage={error} />
        )}

        {/* Upload progress */}
        {status === "uploading" && (
          <ProgressBar percent={progress} label="Uploading" />
        )}

        {/* Conversion spinner */}
        {status === "converting" && (
          <div className="spinner-wrapper" aria-live="polite">
            <div className="spinner" aria-label="Converting document" />
            <p className="spinner__text">
              Rendering PDF with headless Chromium…
            </p>
          </div>
        )}

        {/* Download CTA */}
        {status === "done" && downloadUrl && (
          <DownloadButton
            href={downloadUrl}
            fileName={fileName}
            onReset={reset}
          />
        )}

        {/* Retry on error */}
        {status === "error" && (
          <button
            id="retry-btn"
            onClick={reset}
            className="btn btn--ghost mt-sm"
            type="button"
          >
            Try again
          </button>
        )}
      </section>

      {/* ── Feature Grid ──────────────────────────────────────────────── */}
      <section className="features" aria-label="Features">
        {[
          {
            icon: "🔒",
            title: "Privacy First",
            desc: "Files are processed in-memory and never stored on disk.",
          },
          {
            icon: "⚡",
            title: "Lightning Fast",
            desc: "Puppeteer renders your PDF in seconds using headless Chromium.",
          },
          {
            icon: "📄",
            title: "Faithful Output",
            desc: "Mammoth preserves headings, tables, images, and lists accurately.",
          },
          {
            icon: "🛡",
            title: "Rate Limited",
            desc: "In-memory rate limiting protects the API from abuse.",
          },
          {
            icon: "🌍",
            title: "Cross-Platform",
            desc: "Works seamlessly across Windows, macOS, Linux, and all modern browsers.",
          },
          {
            icon: "☁️",
            title: "Cloud Ready",
            desc: "Optimized for serverless deployment on platforms like Vercel and scalable cloud environments.",
          },
        ].map(({ icon, title, desc }) => (
          <div className="feature-card" key={title}>
            <span className="feature-card__icon">{icon}</span>
            <h3 className="feature-card__title">{title}</h3>
            <p className="feature-card__desc">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
};

export default ConverterPage;
