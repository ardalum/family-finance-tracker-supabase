import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 5;

export default function BudgetVsSpendingTable({
  rows,
  title = "Budget vs Spending",
  emptyMessage = "No budget categories for this month.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = Math.max(rows.length - previewRows.length, 0);

  return (
    <Card className="overflow-hidden">
      <SectionHeader title={title} />
      {rows.length === 0 ? <Empty message={emptyMessage} /> : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const over = row.remaining < 0;
            const near = row.percentUsed >= 90;
            return (
              <article key={row.category} className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-text-main">{row.category}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${over ? "bg-status-dangerBg text-status-dangerDark" : near ? "bg-status-warningBg text-status-warningDark" : "bg-status-successBg text-status-successDark"}`}>
                        {row.percentUsed.toFixed(0)}% used
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      Budget {formatCurrency(row.budget)} · Spent {formatCurrency(row.spent)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className={`text-sm font-semibold ${over ? "text-status-danger" : "text-text-main"}`}>
                      {formatCurrency(row.remaining)}
                    </p>
                    <p className="text-xs text-text-muted">Remaining</p>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-muted">
                  <div
                    className={`h-full rounded-full ${over ? "bg-status-danger" : near ? "bg-status-warning" : "bg-status-success"}`}
                    style={{ width: `${Math.min(Math.max(row.percentUsed, 0), 100)}%` }}
                    aria-hidden="true"
                  />
                </div>
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-text-muted">
              Showing {previewRows.length} of {rows.length}. Open Monthly Budget to review all categories.
            </p>
          ) : (
            <p className="px-1 text-xs font-medium text-text-muted">
              Open Monthly Budget to adjust category limits.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="border-b border-app-border p-5">
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">Categories that are near or over budget.</p>
    </div>
  );
}

function Empty({ message }) {
  return (
    <div className="grid gap-1 p-8 text-center text-sm text-text-muted">
      <p>{message}</p>
      <p className="text-xs">No budget category needs attention right now.</p>
    </div>
  );
}
