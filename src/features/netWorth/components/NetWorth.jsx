import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { summarizeNetWorthForMonth } from "../netWorthService.js";

export default function NetWorth({
  cashAccounts,
  accountBalanceSnapshots,
  liabilityAccounts,
  liabilityBalanceSnapshots,
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const summary = useMemo(
    () =>
      summarizeNetWorthForMonth({
        cashAccounts,
        accountBalanceSnapshots,
        liabilityAccounts,
        liabilityBalanceSnapshots,
        monthKey: selectedMonth,
      }),
    [
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
      selectedMonth,
    ],
  );
  const statusLabel = useMemo(() => {
    if (summary.status === "missing-data") return "Missing snapshot data";
    if (summary.status === "positive") return "Positive net worth";
    if (summary.status === "negative") return "Negative net worth";
    return "Net worth is currently neutral";
  }, [summary.status]);

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Net worth month</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Net worth uses manual account and debt snapshots.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Savings goals are not counted unless represented by account balance snapshots.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Credit card balances are not counted unless entered as liability snapshots.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Net worth does not change spending, income, savings, budget, or cash-flow totals.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Use the month selector to review the latest snapshots recorded in that month.
            </p>
          </div>
          <Select
            label="Month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-5">
          <p className="text-sm text-text-muted">Loading net worth snapshot data...</p>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {summary.summaryRows.map((row) => (
          <Card key={row.label} className="p-5">
            <p className="text-sm font-medium text-text-muted">{row.label}</p>
            <p className="mt-2 text-3xl font-semibold text-text-main">
              {formatCurrency(row.value)}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium text-text-muted">Status</p>
        <p className="mt-1 text-base font-semibold text-text-main">{statusLabel}</p>
        {summary.status === "negative" ? (
          <p className="mt-1 text-sm text-text-muted">
            Liabilities are currently higher than tracked assets for this month.
          </p>
        ) : null}
      </Card>

      {!summary.hasAnySnapshots ? (
        <EmptyState>{summary.emptyMessage}</EmptyState>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="p-5">
            <h3 className="text-base font-semibold text-text-main">Asset snapshots</h3>
            <div className="mt-4 grid gap-2">
              {summary.assetRows.length === 0 ? (
                <EmptyState>No asset snapshots for this month.</EmptyState>
              ) : (
                summary.assetRows.map((row) => (
                  <div
                    key={row.accountId}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{row.name}</p>
                    <p className="text-xs text-text-muted">
                      {row.type} - Snapshot: {row.snapshotDate || "N/A"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-main">
                      {formatCurrency(row.balanceAmount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-base font-semibold text-text-main">Liability snapshots</h3>
            <div className="mt-4 grid gap-2">
              {summary.liabilityRows.length === 0 ? (
                <EmptyState>No liability snapshots for this month.</EmptyState>
              ) : (
                summary.liabilityRows.map((row) => (
                  <div
                    key={row.accountId}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{row.name}</p>
                    <p className="text-xs text-text-muted">
                      {row.type} - Snapshot: {row.snapshotDate || "N/A"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-main">
                      {formatCurrency(row.balanceAmount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </section>
  );
}

NetWorth.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
