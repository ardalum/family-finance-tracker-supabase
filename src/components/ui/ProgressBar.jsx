import { formatCurrency } from "../../lib/formatters.js";

export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  helperText,
  className = "",
  trackClassName = "",
  fillClassName = "",
}) {
  const safeMax = Math.max(Number(max) || 0, 0);
  const safeValue = Math.max(Number(value) || 0, 0);
  const percent = safeMax > 0 ? Math.min((safeValue / safeMax) * 100, 100) : 0;

  return (
    <div className={`grid gap-1.5 ${className}`}>
      {label ? <p className="text-sm font-semibold text-text-main">{label}</p> : null}
      <div
        className={`h-2.5 overflow-hidden rounded-full bg-app-soft ${trackClassName}`}
        role="img"
        aria-label={
          label
            ? `${label}: ${safeValue.toFixed(0)} of ${safeMax.toFixed(0)} (${percent.toFixed(0)}%)`
            : `${percent.toFixed(0)}%`
        }
      >
        <div
          className={`h-full rounded-full bg-brand-primary ${fillClassName}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : (
        <p className="text-xs text-text-muted">
          {formatCurrency(safeValue)} of {formatCurrency(safeMax)} ({percent.toFixed(0)}%)
        </p>
      )}
    </div>
  );
}
