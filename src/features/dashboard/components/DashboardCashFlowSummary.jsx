import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getDashboardCashFlow } from "../dashboardCashFlow.js";

export default function DashboardCashFlowSummary({
  selectedMonth,
  incomeEntries,
  savingsContributions,
  cashAccounts,
  accountBalanceSnapshots,
  accountMoneyMovements,
  budgetTotal,
  remainingBudget,
  spendingTotal,
  recurringRemaining,
  unpaidCardBalanceTotal,
}) {
  const cashFlow = getDashboardCashFlow({
    selectedMonth,
    incomeEntries,
    savingsContributions,
    cashAccounts,
    accountBalanceSnapshots,
    accountMoneyMovements,
    budgetTotal,
    remainingBudget,
    spendingTotal,
    recurringRemaining,
    unpaidCardBalanceTotal,
  });

  const netCashFlow = cashFlow.incomeTotal - cashFlow.spendingTotal;
  const netPositive = netCashFlow >= 0;
  const budgetUsagePct =
    cashFlow.budgetTotal > 0
      ? Math.min(100, Math.max(0, (cashFlow.spendingTotal / cashFlow.budgetTotal) * 100))
      : 0;
  const netVsBudget = netCashFlow - cashFlow.remainingBudget;
  const netVsBudgetPositive = netVsBudget >= 0;
  const trendPoints = [
    Math.max(0, cashFlow.incomeTotal),
    Math.max(0, cashFlow.spendingTotal),
    Math.max(0, cashFlow.recurringRemaining),
    Math.max(0, cashFlow.unpaidCardBalanceTotal),
    Math.max(0, Math.abs(cashFlow.plannedCashCushion)),
    Math.max(0, cashFlow.cashPositionTotal),
  ];
  const trendMax = Math.max(...trendPoints, 1);
  const chartPoints = trendPoints
    .map((point, index) => {
      const x = (index / (trendPoints.length - 1)) * 100;
      const y = 100 - (point / trendMax) * 100;
      return `${x},${Math.max(6, Math.min(94, y))}`;
    })
    .join(" ");
  const chartAreaPoints = `${chartPoints} 100,30 0,30`;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-main">Net cash flow</h3>
          <span className="rounded-full bg-app-muted px-2.5 py-1 text-xs font-semibold text-text-soft">
            {selectedMonth}
          </span>
        </div>
        <p
          className={`mt-3 text-4xl font-semibold tracking-tight ${netPositive ? "text-status-successDark" : "text-status-danger"}`}
        >
          {formatCurrency(netCashFlow)}
        </p>
        <p className="mt-1 text-sm text-text-muted">Income minus spending this month</p>
        <p
          className={`mt-1 text-xs font-semibold ${netVsBudgetPositive ? "text-status-successDark" : "text-status-warningDark"}`}
        >
          {netVsBudgetPositive ? "+" : ""}
          {formatCurrency(netVsBudget)} vs budget remaining
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        <Metric label="Income" value={formatCurrency(cashFlow.incomeTotal)} tone="good" />
        <Metric label="Spending" value={formatCurrency(cashFlow.spendingTotal)} tone="warn" />
        <Metric label="Cash position" value={formatCurrency(cashFlow.cashPositionTotal)} />
        <Metric
          label="Planned cushion"
          value={formatCurrency(cashFlow.plannedCashCushion)}
          tone={cashFlow.plannedCashCushion < 0 ? "danger" : "good"}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-text-muted">
          <span>Month trend</span>
          <span>{Math.round(budgetUsagePct)}% budget used</span>
        </div>
        <div className="rounded-xl border border-app-border bg-app-background px-2 py-1.5">
          <svg viewBox="0 0 100 30" className="h-14 w-full" aria-hidden="true">
            <defs>
              <linearGradient id="cashflowLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1E3A5F" />
                <stop offset="100%" stopColor="#16A34A" />
              </linearGradient>
            </defs>
            <polyline
              points={chartPoints}
              fill="none"
              stroke="url(#cashflowLine)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon points={chartAreaPoints} fill="rgba(30,58,95,0.08)" stroke="none" />
          </svg>
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "good"
      ? "text-status-successDark"
      : tone === "warn"
        ? "text-status-warningDark"
        : tone === "danger"
          ? "text-status-danger"
          : "text-text-main";

  return (
    <div className="rounded-xl border border-app-border bg-app-background px-3 py-2.5">
      <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
