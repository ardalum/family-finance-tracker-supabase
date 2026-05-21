import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 5;

export default function BudgetVsSpendingTable({
  rows,
  title = "Budget vs Spending",
  emptyMessage = "No budget categories for this month.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const totalBudget = rows.reduce((sum, row) => sum + Number(row.budget || 0), 0);
  const totalSpent = rows.reduce((sum, row) => sum + Number(row.spent || 0), 0);
  const usagePct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const safeUsagePct = Math.min(100, Math.max(0, usagePct));

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-main">{title}</h3>
          <span className="text-sm font-semibold text-text-soft">
            {usagePct > 999 ? "999%+" : `${Math.round(usagePct)}%`}
          </span>
        </div>
        <p className="mt-1 text-sm text-text-muted">{formatCurrency(totalSpent)} of {formatCurrency(totalBudget)} planned budget used.</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-app-muted">
          <div
            className={`h-full rounded-full ${safeUsagePct >= 100 ? "bg-status-danger" : safeUsagePct >= 85 ? "bg-status-warning" : "bg-status-success"}`}
            style={{ width: `${safeUsagePct}%` }}
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{emptyMessage}</div>
      ) : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const rawPct = Number(row.percentUsed || 0);
            const pct = Math.min(100, Math.max(0, rawPct));
            const over = row.remaining < 0;
            const near = rawPct >= 90;
            return (
              <article key={row.category} className="rounded-xl border border-app-border bg-app-background p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-text-main">{row.category}</h4>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${over ? "bg-status-dangerBg text-status-dangerDark" : near ? "bg-status-warningBg text-status-warningDark" : "bg-status-successBg text-status-successDark"}`}>
                    {rawPct > 999 ? "999%+" : `${Math.round(rawPct)}%`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                  <div
                    className={`h-full rounded-full ${over ? "bg-status-danger" : near ? "bg-status-warning" : "bg-status-success"}`}
                    style={{ width: `${pct}%` }}
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
