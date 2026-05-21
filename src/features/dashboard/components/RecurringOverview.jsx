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

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-text-main">{formatCurrency(summary.remainingTotal)}</p>
        <p className="text-sm text-text-muted">Remaining from {formatCurrency(summary.estimatedTotal)} total bills</p>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{emptyMessage}</div>
      ) : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const variableNeedsActual =
              row.template.billType === "variable" &&
              row.displayStatus !== "Paid" &&
              !row.instance?.actualAmount;
            return (
              <article key={row.template.id} className="rounded-xl border border-app-border bg-app-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-text-main">{row.template.name}</h4>
                    <p className="text-xs text-text-muted">Due {row.dueDate}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(row.displayStatus, variableNeedsActual)}`}>
                    {row.displayStatus}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{row.template.billType === "fixed" ? "Fixed" : "Variable"}</span>
                  <span className="font-semibold text-text-main">{formatCurrency(row.amount)}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
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
