/**
 * ProgressBar.jsx
 * Animated progress bar that fills from 0 to `percent`.
 */

/**
 * @param {{ percent: number, label?: string }} props
 */
const ProgressBar = ({ percent, label }) => {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div
      className="progress-wrapper"
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      {label && (
        <p className="progress-label">
          {label} — {clampedPercent}%
        </p>
      )}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
