import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getTransactionTypeLabel } from "../../spending/spendingService.js";
import { getDashboardData } from "../../dashboard/dashboardUtils.js";
import InsightsSummaryCards from "./InsightsSummaryCards.jsx";

const BUDGET_STATUS_COPY = {
  over: {
    label: "Over budget",
    tone: "text-status-danger",
    badge: "border-status-danger/30 bg-status-danger/10 text-status-danger",
  },
  near: {
    label: "Near limit",
    tone: "text-status-warning",
    badge: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  },
  safe: {
    label: "Safe",
    tone: "text-status-success",
    badge: "border-status-success/30 bg-status-success/10 text-status-success",
  },
  unused: {
    label: "No spending",
    tone: "text-text-muted",
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
  const topCategories = useMemo(
    () => getTopCategories(data.chartData.spendingByCategory),
    [data.chartData.spendingByCategory],
  );
  const transactionTypeRows = useMemo(
    () => getTransactionTypeRows(data.transactions),
    [data.transactions],
  );
  const topMerchants = useMemo(() => getTopMerchants(data.transactions), [data.transactions]);
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
              A read-only summary of where the money went, which budgets need attention, and which
              transaction types are affecting the month.
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

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <TopSpendingCategories categories={topCategories} totalSpent={data.summary.spendingTotal} />
        <BudgetPerformance budgetInsights={budgetInsights} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TransactionTypeBreakdown rows={transactionTypeRows} />
        <TopMerchants merchants={topMerchants} />
      </section>
    </section>
  );
}

function InsightsEmptyState({ selectedMonth }) {
  return (
    <Card className="border-dashed p-8 text-center">
      <p className="text-sm font-semibold text-text-main">
        No insight data for {formatMonthLabel(selectedMonth)} yet.
      </p>
      <p className="mx-auto mt-2 max-w-xl text-sm text-text-muted">
        Add budgets and transactions for this month to unlock spending categories, budget health,
        transaction type totals, and merchant trends.
      </p>
    </Card>
  );
}

function TopSpendingCategories({ categories, totalSpent }) {
  return (
    <Card>
      <SectionHeader
        title="Top Spending Categories"
        description="Highest spending areas for the selected month. Refunds lower the net amount."
      />
      {categories.length === 0 ? (
        <EmptyPanel message="No category spending for this month." />
      ) : (
        <div className="divide-y divide-app-border">
          {categories.map((category, index) => {
            const percent = totalSpent > 0 ? Math.min((category.value / totalSpent) * 100, 100) : 0;
            return (
              <div key={category.name} className="grid gap-3 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      #{index + 1}
                    </p>
                    <p
                      className="truncate text-sm font-semibold text-text-main"
                      title={category.name}
                    >
                      {category.name}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-text-main">
                    {formatCurrency(category.value)}
                  </p>
                </div>
                <ProgressBar percent={percent} />
                <p className="text-xs text-text-muted">
                  {percent.toFixed(0)}% of tracked net spending
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function BudgetPerformance({ budgetInsights }) {
  const sections = [
    ["Over budget", budgetInsights.over, "over"],
    ["Near limit", budgetInsights.near, "near"],
    ["Under budget / safe", budgetInsights.safe, "safe"],
  ];

  return (
    <Card>
      <SectionHeader
        title="Budget Performance"
        description="Category health based on spending compared with the monthly budget."
      />
      {budgetInsights.all.length === 0 ? (
        <EmptyPanel message="No budget categories for this month." />
      ) : (
        <div className="grid gap-4 p-5">
          {sections.map(([title, rows, status]) => (
            <BudgetStatusGroup key={title} title={title} rows={rows} status={status} />
          ))}
        </div>
      )}
    </Card>
  );
}

function BudgetStatusGroup({ title, rows, status }) {
  const copy = BUDGET_STATUS_COPY[status];

  return (
    <div className="rounded-2xl border border-app-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-main">{title}</h4>
        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${copy.badge}`}>
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Nothing here right now.</p>
      ) : (
        <div className="grid gap-3">
          {rows.slice(0, 5).map((row) => (
            <div key={row.category} className="grid gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-main" title={row.category}>
                    {row.category}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatCurrency(row.spent)} spent of {formatCurrency(row.budget)}
                  </p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${copy.tone}`}>
                  {row.percentUsed.toFixed(0)}%
                </p>
              </div>
              <ProgressBar percent={row.percentUsed} />
            </div>
          ))}
          {rows.length > 5 ? (
            <p className="text-xs text-text-muted">+{rows.length - 5} more</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TransactionTypeBreakdown({ rows }) {
  return (
    <Card>
      <SectionHeader
        title="Spending by Transaction Type"
        description="Shows how expenses, refunds, income, payments, and other records appear this month."
      />
      {rows.length === 0 ? (
        <EmptyPanel message="No transactions for this month." />
      ) : (
        <div className="divide-y divide-app-border">
          {rows.map((row) => (
            <div
              key={row.type}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <div>
                <p className="text-sm font-semibold text-text-main">{row.label}</p>
                <p className="text-xs text-text-muted">
                  {row.count} transaction{row.count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-main">{formatCurrency(row.total)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TopMerchants({ merchants }) {
  return (
    <Card>
      <SectionHeader
        title="Top Merchants"
        description="Merchants with the highest net tracked spending this month."
      />
      {merchants.length === 0 ? (
        <EmptyPanel message="No merchant spending for this month." />
      ) : (
        <div className="divide-y divide-app-border">
          {merchants.map((merchant, index) => (
            <div
              key={merchant.name}
              className="grid gap-2 px-5 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center"
            >
              <span className="text-sm font-semibold text-text-muted">#{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main" title={merchant.name}>
                  {merchant.name}
                </p>
                <p className="text-xs text-text-muted">
                  {merchant.count} transaction{merchant.count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-main">
                {formatCurrency(merchant.total)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
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
  return <div className="p-8 text-center text-sm text-text-muted">{message}</div>;
}

function ProgressBar({ percent }) {
  const safePercent = Math.max(0, Math.min(Number(percent) || 0, 100));
  return (
    <div className="h-2 overflow-hidden rounded-full bg-app-soft">
      <div className="h-full rounded-full bg-brand-primary" style={{ width: `${safePercent}%` }} />
    </div>
  );
}

function getBudgetInsights(rows) {
  const all = rows.map((row) => {
    let status = "safe";
    if (row.spent <= 0) status = "unused";
    if (row.percentUsed >= 90) status = "near";
    if (row.remaining < 0) status = "over";
    return { ...row, status };
  });

  return {
    all,
    over: all.filter((row) => row.status === "over").sort((a, b) => a.remaining - b.remaining),
    near: all.filter((row) => row.status === "near").sort((a, b) => b.percentUsed - a.percentUsed),
    safe: all
      .filter((row) => row.status === "safe" || row.status === "unused")
      .sort((a, b) => b.remaining - a.remaining),
  };
}

function getTopCategories(categories) {
  return categories.filter((category) => Number(category.value || 0) > 0).slice(0, 8);
}

function getTransactionTypeRows(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const type = transaction.transactionType || "expense";
    const current = totals.get(type) ?? { type, total: 0, count: 0 };
    totals.set(type, {
      ...current,
      total: current.total + Number(transaction.amount || 0),
      count: current.count + 1,
    });
  });

  return Array.from(totals.values())
    .map((row) => ({ ...row, label: getTransactionTypeLabel(row.type) }))
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total));
}

function getTopMerchants(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    if (transaction.transactionType === "payment" || transaction.transactionType === "transfer")
      return;
    const name = transaction.merchant || "Unknown merchant";
    const amount =
      transaction.transactionType === "refund"
        ? -Number(transaction.amount || 0)
        : Number(transaction.amount || 0);
    const current = totals.get(name) ?? { name, total: 0, count: 0 };
    totals.set(name, {
      ...current,
      total: current.total + amount,
      count: current.count + 1,
    });
  });

  return Array.from(totals.values())
    .filter((merchant) => merchant.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}
