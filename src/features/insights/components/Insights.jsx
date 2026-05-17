import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import HorizontalBarChart from "../../../components/ui/HorizontalBarChart.jsx";
import ProgressBar from "../../../components/ui/ProgressBar.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getDashboardData } from "../../dashboard/dashboardUtils.js";
import InsightsSummaryCards from "./InsightsSummaryCards.jsx";
import {
  calculateSharePercent,
  getBudgetInsights,
  getTopCategories,
  getTopMerchants,
  getTransactionTypeMixRows,
} from "../insightsChartData.js";

const BUDGET_STATUS_COPY = {
  over: {
    label: "Over budget",
    badge: "border-status-danger/30 bg-status-danger/10 text-status-danger",
  },
  near: {
    label: "Near limit",
    badge: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  },
  safe: {
    label: "Safe",
    badge: "border-status-success/30 bg-status-success/10 text-status-success",
  },
  unused: {
    label: "No spending",
    badge: "border-app-border bg-app-soft text-text-muted",
  },
};

export default function Insights({
  appData,
  selectedMonth = getCurrentMonthKey(),
  onMonthChange,
  loading = false,
  error = "",
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);

  const budgetInsights = useMemo(() => getBudgetInsights(data.budgetRows), [data.budgetRows]);
  const categoryRows = useMemo(
    () => getTopCategories(data.chartData.spendingByCategory),
    [data.chartData.spendingByCategory],
  );
  const merchantRows = useMemo(() => getTopMerchants(data.transactions), [data.transactions]);
  const transactionTypeRows = useMemo(
    () => getTransactionTypeMixRows(data.transactions),
    [data.transactions],
  );

  const hasInsightData = data.transactions.length > 0 || data.budgets.length > 0;

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Insights month</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              Reporting center for spending patterns, budget pressure, merchant concentration, and
              transaction mix using current tracked month data.
            </p>
            {loading ? <p className="mt-2 text-sm text-text-muted">Loading insights...</p> : null}
            {error ? <p className="mt-2 text-sm font-medium text-status-danger">{error}</p> : null}
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

      {!hasInsightData ? <InsightsEmptyState selectedMonth={selectedMonth} /> : null}

      <InsightsSummaryCards summary={data.summary} overBudgetCount={budgetInsights.over.length} />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Spending by Category"
            description="Net category spending ranked highest to lowest for this month."
          />
          <div className="p-5">
            <HorizontalBarChart
              title="Spending by Category"
              description="Category spending bars with amount labels"
              items={categoryRows}
              valueLabel="Net spending"
              emptyMessage="No category spending for this month."
            />
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Top Merchants"
            description="Merchants with highest net spending this month, excluding non-spending transfer/payment effects."
          />
          <div className="p-5">
            <HorizontalBarChart
              title="Top Merchants"
              description="Merchant spending bars with amount and transaction counts"
              items={merchantRows}
              valueLabel="Net spending"
              emptyMessage="No merchant spending for this month."
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Budget Usage"
            description="Spent vs budget with clear status labels for over, near, and safe categories."
          />
          {budgetInsights.all.length === 0 ? (
            <EmptyPanel message="No budget categories for this month." />
          ) : (
            <div className="grid gap-4 p-5">
              <BudgetUsageGroup title="Over budget" rows={budgetInsights.over} />
              <BudgetUsageGroup title="Near limit" rows={budgetInsights.near} />
              <BudgetUsageGroup title="Under budget / safe" rows={budgetInsights.safe} />
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Transaction Type Mix"
            description="Shows entered amounts and net spending impact by transaction type (refunds reduce spend; payments/transfers/income have zero net spending impact)."
          />
          {transactionTypeRows.length === 0 ? (
            <EmptyPanel message="No transactions for this month." />
          ) : (
            <div className="grid gap-3 p-5">
              {transactionTypeRows.map((row) => (
                <TransactionTypeMixRow key={row.type} row={row} rows={transactionTypeRows} />
              ))}
            </div>
          )}
        </Card>
      </section>
    </section>
  );
}

function InsightsEmptyState({ selectedMonth }) {
  return (
    <Card className="border-dashed">
      <EmptyState
        className="p-8"
        title={`No insight data for ${formatMonthLabel(selectedMonth)} yet.`}
        description="Add budgets and transactions for this month to unlock category, merchant, budget-usage, and transaction-type reporting."
      />
    </Card>
  );
}

function BudgetUsageGroup({ title, rows }) {
  return (
    <div className="rounded-2xl border border-app-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-main">{title}</h4>
        <span className="rounded-full border border-app-border bg-app-soft px-2.5 py-1 text-xs font-semibold text-text-main">
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Nothing here right now.</p>
      ) : (
        <div className="grid gap-3">
          {rows.slice(0, 6).map((row) => {
            const copy = BUDGET_STATUS_COPY[row.status] ?? BUDGET_STATUS_COPY.safe;
            return (
              <div key={row.category} className="grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold text-text-main"
                      title={row.category}
                    >
                      {row.category}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(row.spent)} of {formatCurrency(row.budget)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${copy.badge}`}
                  >
                    {copy.label}
                  </span>
                </div>
                <ProgressBar
                  value={row.spent}
                  max={row.budget}
                  label={row.category}
                  helperText={`${row.percentUsed.toFixed(0)}% used`}
                />
              </div>
            );
          })}
          {rows.length > 6 ? (
            <p className="text-xs text-text-muted">+{rows.length - 6} more</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TransactionTypeMixRow({ row, rows }) {
  const totalAbsImpact = rows.reduce((sum, current) => sum + Math.abs(current.netImpact), 0);
  const share = calculateSharePercent(Math.abs(row.netImpact), totalAbsImpact);

  return (
    <div className="rounded-xl border border-app-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main">{row.label}</p>
          <p className="text-xs text-text-muted">
            {row.count} transaction{row.count === 1 ? "" : "s"}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-text-main">
          {formatCurrency(row.rawTotal)}
        </p>
      </div>
      <div className="mt-2">
        <ProgressBar
          value={Math.abs(row.netImpact)}
          max={totalAbsImpact}
          label={`${row.label} net impact share`}
          helperText={`Net impact ${formatCurrency(row.netImpact)} � ${share.toFixed(0)}% of total net impact`}
        />
      </div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-app-border p-5">
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}

function EmptyPanel({ message }) {
  return <EmptyState className="p-8" description={message} />;
}
