/**
 * StatusCard.jsx
 * Displays the current conversion status with an icon and message.
 * Maps the status string from useConverter to a visual representation.
 */

const STATUS_CONFIG = {
  uploading: {
    icon: "⬆",
    title: "Uploading…",
    message: "Sending your document to the server.",
    className: "status-card--uploading",
  },
  converting: {
    icon: "⚙",
    title: "Converting…",
    message: "Your document is being processed. This may take a moment.",
    className: "status-card--converting",
  },
  done: {
    icon: "✓",
    title: "Conversion Complete!",
    message: "Your PDF is ready to download.",
    className: "status-card--done",
  },
  error: {
    icon: "✕",
    title: "Conversion Failed",
    message: null, // provided via `errorMessage` prop
    className: "status-card--error",
  },
};

/**
 * @param {{ status: string, errorMessage: string | null }} props
 */
const StatusCard = ({ status, errorMessage }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return null;

  return (
    <div
      className={`status-card ${cfg.className}`}
      role="status"
      aria-live="polite"
    >
      <span className="status-card__icon">{cfg.icon}</span>
      <div className="status-card__body">
        <p className="status-card__title">{cfg.title}</p>
        <p className="status-card__message">{cfg.message || errorMessage}</p>
      </div>
    </div>
  );
};

export default StatusCard;
