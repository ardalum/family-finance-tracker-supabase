import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 5;

export default function RecurringOverview({
  rows,
  summary,
  title = "Recurring Bills Overview",
  emptyMessage = "No recurring payments due this month.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = Math.max(rows.length - previewRows.length, 0);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">
          Total {formatCurrency(summary.estimatedTotal)} / Paid {formatCurrency(summary.paidTotal)} / Remaining {formatCurrency(summary.remainingTotal)}
        </p>
      </div>
      {rows.length === 0 ? <Empty message={emptyMessage} /> : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const variableNeedsActual = row.template.billType === "variable" && row.displayStatus !== "Paid" && !row.instance?.actualAmount;
            return (
              <article key={row.template.id} className="rounded-2xl border border-app-border bg-app-surface px-4 py-3">
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-text-main">{row.template.name}</h4>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(row.displayStatus, variableNeedsActual)}`}>
                        {row.displayStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {row.template.billType === "fixed" ? "Fixed" : "Variable"} · Due {row.dueDate}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-text-main">{formatCurrency(row.amount)}</p>
                    <p className="text-xs text-text-muted">Actual / expected</p>
                  </div>
                </div>
                {variableNeedsActual ? (
                  <p className="mt-2 rounded-xl bg-status-warningBg px-3 py-2 text-xs font-medium text-status-warningDark">
                    Needs actual amount before payment tracking.
                  </p>
                ) : null}
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-text-muted">
              Showing {previewRows.length} of {rows.length}. Open Recurring Payments to review the rest.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}

function Empty({ message }) {
  return <div className="p-8 text-center text-sm text-text-muted">{message}</div>;
}

function getStatusBadgeClass(status, variableNeedsActual) {
  if (status === "Paid") return "bg-status-successBg text-status-successDark";
  if (status === "Past due") return "bg-status-dangerBg text-status-dangerDark";
  if (["Due now", "Due soon"].includes(status) || variableNeedsActual) {
    return "bg-status-warningBg text-status-warningDark";
  }
  if (status === "Skipped") return "bg-app-muted text-text-soft";
  return "bg-status-infoBg text-status-infoDark";
}
