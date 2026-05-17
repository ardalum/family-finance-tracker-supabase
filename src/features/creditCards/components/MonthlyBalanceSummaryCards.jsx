import { formatCurrency } from "../../../lib/formatters.js";

export default function MonthlyBalanceSummaryCards({ summary }) {
  const unpaidTotal = summary.unpaidBalance;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MonthlyBalanceSummaryCard
        label="Statement balance"
        value={formatCurrency(summary.statementBalance, { cents: true })}
        helper="Total entered for this month"
      />
      <MonthlyBalanceSummaryCard
        label="Unpaid balance"
        value={formatCurrency(unpaidTotal, { cents: true })}
        helper="Still needs payment"
        danger={unpaidTotal > 0}
      />
      <MonthlyBalanceSummaryCard
        label="Checked no balance"
        value={summary.checkedNoBalanceCount}
        helper="Confirmed $0 statement"
      />
      <MonthlyBalanceSummaryCard
        label="Not checked"
        value={summary.notCheckedCount}
        helper="Still needs website review"
        danger={summary.notCheckedCount > 0}
      />
    </div>
  );
}

function MonthlyBalanceSummaryCard({ label, value, helper, danger = false }) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p
        className={`mt-1 text-2xl font-semibold ${danger ? "text-status-danger" : "text-text-main"}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-text-muted">{helper}</p>
    </div>
  );
}
