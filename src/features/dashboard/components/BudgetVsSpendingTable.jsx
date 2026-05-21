import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 5;

export default function BudgetVsSpendingTable({
  rows,
  title = "Budget vs Spending",
  emptyMessage = "No budget categories for this month.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">Track category progress and overspend risk.</p>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{emptyMessage}</div>
      ) : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const over = row.remaining < 0;
            const near = row.percentUsed >= 90;
            return (
              <article key={row.category} className="rounded-xl border border-app-border bg-app-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-text-main">{row.category}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${over ? "bg-status-dangerBg text-status-dangerDark" : near ? "bg-status-warningBg text-status-warningDark" : "bg-status-successBg text-status-successDark"}`}>
                    {Math.round(row.percentUsed)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                  <div
                    className={`h-full rounded-full ${over ? "bg-status-danger" : near ? "bg-status-warning" : "bg-status-success"}`}
                    style={{ width: `${Math.min(Math.max(row.percentUsed, 0), 100)}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{formatCurrency(row.spent)} / {formatCurrency(row.budget)}</span>
                  <span className={over ? "font-semibold text-status-danger" : "font-semibold text-text-main"}>
                    {formatCurrency(row.remaining)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
