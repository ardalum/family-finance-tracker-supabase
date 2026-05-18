import { formatCurrency } from "../../lib/formatters.js";

export default function HorizontalBarChart({
  title,
  description,
  items = [],
  valueLabel = "Amount",
  emptyMessage = "No data to display.",
  maxItems = 8,
}) {
  const rows = items.slice(0, maxItems);
  const maxValue = rows.reduce((max, row) => Math.max(max, Number(row.value) || 0), 0);

  if (rows.length === 0) {
    return <p className="text-sm text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-3" role="img" aria-label={description || title}>
      {rows.map((row, index) => {
        const value = Number(row.value) || 0;
        const percent = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

        return (
          <div key={row.id ?? row.label} className="grid gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 truncate text-sm font-medium text-text-main" title={row.label}>
                {index + 1}. {row.label}
              </p>
              <p className="shrink-0 text-sm font-semibold text-text-main">
                {row.formattedValue ?? formatCurrency(value)}
              </p>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-app-soft">
              <div
                className="h-full rounded-full bg-brand-primary"
                style={{ width: `${percent}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="text-xs text-text-muted">
              {valueLabel}: {row.formattedValue ?? formatCurrency(value)}
              {row.helperText ? ` - ${row.helperText}` : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
