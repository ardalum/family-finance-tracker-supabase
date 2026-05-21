import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileText,
  Goal,
  Split,
  BarChart3,
  Wallet,
} from "lucide-react";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { createDashboardV2Data } from "../dashboardV2Adapter.js";

const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";

const actionTargets = {
  "Add bill": { view: "recurring", target: "add-recurring" },
  "Transfer money": { view: "accounts", target: "accounts-home" },
  "Add goal": { view: "savings", target: "monthly-savings" },
  "Scan receipt": { view: "spending", target: "add-transaction" },
  "Split expense": { view: "spending", target: "add-transaction" },
  "View reports": { view: "insights", target: "insights-home" },
};

const actionIcons = {
  bill: FileText,
  transfer: ArrowRight,
  goal: Goal,
  scan: Camera,
  split: Split,
  report: BarChart3,
};

export default function DashboardV2({
  appData,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
}) {
  const data = createDashboardV2Data({ appData, selectedMonth });

  if (loading) {
    return (
      <section className="grid gap-5">
        <Card className="p-5 text-sm text-text-muted">Loading dashboard...</Card>
      </section>
    );
  }

  const hasMonthlyTrend = data.netCashFlow.trendValues.length >= 2;
  const trendValues = hasMonthlyTrend ? data.netCashFlow.trendValues : [0, 0];
  const trendMin = Math.min(...trendValues);
  const trendMax = Math.max(...trendValues);
  const trendSpread = Math.max(trendMax - trendMin, 1);
  const trendPoints = trendValues
    .map((value, index) => {
      const x = trendValues.length <= 1 ? 0 : (index / (trendValues.length - 1)) * 100;
      const y = 100 - ((value - trendMin) / trendSpread) * 100;
      return `${x},${Math.max(6, Math.min(94, y))}`;
    })
    .join(" ");

  return (
    <section className="grid gap-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <div className="inline-flex items-center gap-2 text-base font-semibold text-text-main">
                  <CircleDollarSign size={18} aria-hidden="true" />
                  Net Cash Flow
                </div>
                <button
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                  type="button"
                >
                  View cash flow
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-4 p-5">
                {error ? (
                  <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
                    {error}
                  </p>
                ) : null}
                <div>
                  <p className="text-5xl font-semibold tracking-tight text-text-main">
                    {formatCurrency(data.netCashFlow.amount)}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{data.netCashFlow.monthLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-status-successDark">
                    +{data.netCashFlow.deltaPct}% {data.netCashFlow.comparisonLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-app-border bg-app-background p-3">
                  {hasMonthlyTrend ? (
                    <>
                      <svg viewBox="0 0 100 34" className="h-28 w-full" aria-hidden="true">
                        <defs>
                          <linearGradient id="v2trend" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(30,58,95,0.20)" />
                            <stop offset="100%" stopColor="rgba(30,58,95,0.00)" />
                          </linearGradient>
                        </defs>
                        <polyline
                          points={trendPoints}
                          fill="none"
                          stroke="#0F2A4A"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="mt-2 grid auto-cols-fr grid-flow-col text-xs text-text-muted">
                        {data.netCashFlow.trendLabels.map((label, index) => (
                          <span key={`${label}-${index}`}>{label}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="grid h-28 place-items-center rounded-lg border border-app-border bg-white/70 text-xs text-text-muted">
                      Not enough monthly trend data yet.
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <div className="inline-flex items-center gap-2 text-base font-semibold text-text-main">
                  <Wallet size={18} aria-hidden="true" />
                  Budget Health
                </div>
                <button
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                  type="button"
                >
                  View budgets
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-5 p-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
                <div
                  className="mx-auto grid h-40 w-40 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#22A06B ${(data.budgetHealth.onTrackPct / 100) * 360}deg, #EEE8DD 0deg)`,
                  }}
                >
                  <div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center">
                    <p className="text-4xl font-semibold leading-none text-text-main">
                      {data.budgetHealth.onTrackPct}%
                    </p>
                    <p className="mt-1 text-sm text-text-muted">On track</p>
                  </div>
                </div>
                <div className="grid gap-2.5">
                  {data.budgetHealth.categories.length === 0 ? (
                    <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                      No budget data for this month.
                    </p>
                  ) : null}
                  {data.budgetHealth.categories.map((category) => {
                    const pctRaw =
                      category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                    const pct = Math.min(100, Math.max(0, pctRaw));
                    const isOverBudget = pctRaw > 100;
                    return (
                      <div key={category.name} className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium text-text-main">{category.name}</span>
                          <span className="text-text-muted">
                            {formatCurrency(category.spent)} / {formatCurrency(category.budget)}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-app-muted">
                          <div
                            className={`h-full rounded-full ${isOverBudget ? "bg-status-danger" : pctRaw >= 85 ? "bg-status-warning" : "bg-status-success"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {isOverBudget ? (
                          <p className="text-[11px] font-semibold text-status-danger">
                            {Math.round(pctRaw)}% of budget
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <h3 className="text-base font-semibold text-text-main">Upcoming Bills</h3>
                <span className="text-sm text-text-muted">Next 14 days</span>
              </div>
              <div className="grid gap-3 p-5">
                {data.upcomingBills.length === 0 ? (
                  <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                    No upcoming bills in this snapshot.
                  </p>
                ) : null}
                {data.upcomingBills.map((bill) => (
                  <article
                    key={`${bill.month}-${bill.day}-${bill.name}`}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-app-border bg-app-background px-3 py-2.5"
                  >
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-app-surface text-center text-xs font-semibold text-text-soft ring-1 ring-app-border">
                      <span>{bill.month}</span>
                      <span>{bill.day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-main">{bill.name}</p>
                      <p
                        className={`text-xs ${bill.tone === "danger" ? "text-status-danger" : bill.tone === "warn" ? "text-status-warningDark" : "text-text-muted"}`}
                      >
                        {bill.dueText}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-text-main">
                      {formatCurrency(bill.amount)}
                    </p>
                  </article>
                ))}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <h3 className="text-base font-semibold text-text-main">Cards & Debt</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                >
                  View all
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-4 p-5">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_100px] sm:items-center">
                  <div>
                    <p className="text-sm text-text-muted">Credit card utilization</p>
                    <p className="text-4xl font-semibold tracking-tight text-text-main">
                      {data.cardsDebt.utilizationPct}%
                    </p>
                    <p className="text-xs text-status-successDark">4% down vs Apr 2025</p>
                  </div>
                  <div
                    className="mx-auto grid h-24 w-24 place-items-center rounded-full"
                    style={{
                      background: `conic-gradient(#22A06B ${(data.cardsDebt.utilizationPct / 100) * 360}deg, #EEE8DD 0deg)`,
                    }}
                  >
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-sm font-semibold text-text-main">
                      {data.cardsDebt.utilizationPct}%
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    Payment due
                  </p>
                  {data.cardsDebt.paymentDue.length === 0 ? (
                    <p className="text-xs text-text-muted">No unpaid statement balances due.</p>
                  ) : null}
                  {data.cardsDebt.paymentDue.map((payment) => (
                    <div
                      key={`${payment.name}-${payment.last4}`}
                      className="flex items-center justify-between gap-2"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-main">{payment.name}</p>
                        <p className="text-xs text-text-muted">
                          ... {payment.last4} - {payment.dueText}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-text-main">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <h3 className="text-base font-semibold text-text-main">Savings Goals</h3>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
                >
                  View goals
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-3 p-5">
                {data.savingsGoals.length === 0 ? (
                  <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                    No active savings goals yet.
                  </p>
                ) : null}
                {data.savingsGoals.map((goal) => (
                  <article
                    key={goal.name}
                    className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text-main">{goal.name}</p>
                      <p className="text-xs font-semibold text-text-muted">{goal.progress}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                      <div
                        className="h-full rounded-full bg-status-success"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                    </p>
                  </article>
                ))}
              </div>
            </Card>

            <Card className="overflow-hidden border-status-warningBg">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <div className="inline-flex items-center gap-2 text-base font-semibold text-text-main">
                  <AlertTriangle size={18} aria-hidden="true" />
                  Needs attention
                </div>
                <span className="rounded-full bg-status-warningBg px-2.5 py-1 text-sm font-semibold text-status-warningDark">
                  {data.alerts.length}
                </span>
              </div>
              <div className="grid gap-3 p-5">
                {data.alerts.length === 0 ? (
                  <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                    No alerts right now.
                  </p>
                ) : null}
                {data.alerts.map((alert) => (
                  <article
                    key={alert.title}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p
                      className={`text-sm font-semibold ${alert.tone === "danger" ? "text-status-danger" : "text-status-warningDark"}`}
                    >
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">{alert.description}</p>
                    <button
                      type="button"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-primary"
                    >
                      {alert.action}
                      <ChevronRight size={12} aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </Card>
          </div>
        </div>

        <aside className="grid gap-5 self-start xl:sticky xl:top-24">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-app-border p-5">
              <h3 className="text-base font-semibold text-text-main">Recent transactions</h3>
              <button type="button" className="text-sm font-semibold text-brand-primary">
                View all
              </button>
            </div>
            <div className="grid gap-2 p-4">
              {data.recentTransactions.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                  No recent transactions for this month.
                </p>
              ) : null}
              {data.recentTransactions.map((tx) => {
                const positive = tx.amount > 0;
                return (
                  <article
                    key={`${tx.merchant}-${tx.dateLabel}`}
                    className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-app-border bg-app-background px-3 py-2.5"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-app-surface text-[11px] font-semibold text-text-soft ring-1 ring-app-border">
                      {tx.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-main">{tx.merchant}</p>
                      <p className="truncate text-xs text-text-muted">{tx.category}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${positive ? "text-status-successDark" : "text-text-main"}`}
                      >
                        {formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-text-muted">{tx.dateLabel}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-app-border p-5">
              <h3 className="text-base font-semibold text-text-main">Family Note</h3>
              <span className="rounded-full bg-app-muted px-2 py-0.5 text-xs font-semibold text-text-muted">
                Static
              </span>
            </div>
            <div className="p-5">
              <blockquote className="rounded-xl border border-[#EADFCF] bg-[#FBF5EA] px-4 py-3 text-sm italic text-text-soft">
                "{data.familyNote.quote}"
                <footer className="mt-2 text-xs font-semibold not-italic text-text-muted">
                  - {data.familyNote.author}
                </footer>
              </blockquote>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-base font-semibold text-text-main">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {data.quickActions.map((action) => {
                const Icon = actionIcons[action.icon] ?? Calendar;
                return (
                  <button
                    key={action.label}
                    type="button"
                    className="grid place-items-center gap-2 rounded-xl border border-app-border bg-app-background px-3 py-3 text-center transition hover:border-brand-primary/40 hover:bg-app-surface"
                    onClick={() => runAction(action.label)}
                  >
                    <Icon size={18} aria-hidden="true" className="text-text-soft" />
                    <span className="text-sm font-medium text-text-main">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function runAction(label) {
  const target = actionTargets[label];
  if (!target) return;
  navigateToView(target.view, target.target);
}

function navigateToView(view, target = "") {
  try {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, view);
  } catch {
    // Navigation should still happen even if storage is unavailable.
  }

  dispatchNavigation(view, target);
}
