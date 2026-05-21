import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  Calendar,
  Camera,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  FileText,
  Goal,
  Heart,
  Quote,
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

  const visibleAlerts = data.alerts.slice(0, 3);
  const remainingAlertCount = Math.max(0, data.alerts.length - visibleAlerts.length);

  return (
    <section className="grid gap-4">
      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
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
                  <p className="rounded-xl border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-sm text-status-dangerDark">
                    {error}
                  </p>
                ) : null}
                <div>
                  <p
                    className="truncate text-4xl font-semibold tracking-tight tabular-nums text-text-main xl:text-[2.6rem]"
                    title={formatCurrency(data.netCashFlow.amount)}
                  >
                    {formatCurrency(data.netCashFlow.amount)}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{data.netCashFlow.monthLabel}</p>
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      data.netCashFlow.deltaPct >= 0 ? "text-status-successDark" : "text-status-danger"
                    }`}
                  >
                    {data.netCashFlow.deltaPct > 0 ? "+" : ""}
                    {data.netCashFlow.deltaPct}% {data.netCashFlow.comparisonLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-app-border bg-app-surfaceSoft p-3">
                  {hasMonthlyTrend ? (
                    <>
                      <svg viewBox="0 0 100 34" className="h-24 w-full" aria-hidden="true">
                        <defs>
                          <linearGradient id="v2trend" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgba(11,27,59,0.18)" />
                            <stop offset="100%" stopColor="rgba(11,27,59,0.00)" />
                          </linearGradient>
                        </defs>
                        <polyline
                          points={trendPoints}
                          fill="none"
                          stroke="#0B1B3B"
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
                    <div className="grid h-20 place-items-center rounded-lg border border-app-border bg-app-surface text-xs text-text-muted">
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
              <div className="grid gap-4 p-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
                <div
                  className="mx-auto grid h-40 w-40 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${getBudgetHealthRingTone(data.budgetHealth.onTrackPct)} ${(data.budgetHealth.onTrackPct / 100) * 360}deg, #F3F1EA 0deg)`,
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
                    <p className="rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                      No budget data for this month.
                    </p>
                  ) : null}
                  {data.budgetHealth.categories.slice(0, 6).map((category) => {
                    const pctRaw =
                      category.budget > 0 ? (category.spent / category.budget) * 100 : 0;
                    const pct = Math.min(100, Math.max(0, pctRaw));
                    const isOverBudget = pctRaw > 100;
                    return (
                      <div key={category.name} className="grid gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="truncate font-medium text-text-main">{category.name}</span>
                          <span
                            className="shrink-0 text-text-muted"
                            title={`${formatCurrency(category.spent)} / ${formatCurrency(category.budget)}`}
                          >
                            {formatCompactCurrency(category.spent)} / {formatCompactCurrency(category.budget)}
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
                            {pctRaw > 999 ? "999%+" : `${Math.round(pctRaw)}%`} of budget
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-app-border p-5">
                <h3 className="text-base font-semibold text-text-main">Upcoming Bills</h3>
                <span className="text-sm text-text-muted">Next 14 days</span>
              </div>
              <div className="grid gap-2.5 p-5">
                {data.upcomingBills.length === 0 ? (
                  <p className="rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                    No upcoming bills in this snapshot.
                  </p>
                ) : null}
                {data.upcomingBills.map((bill) => (
                  <article
                    key={`${bill.month}-${bill.day}-${bill.name}`}
                    className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2.5"
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
                    <p className="text-sm font-semibold text-text-main tabular-nums">
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
                      background: `conic-gradient(#22A06B ${(data.cardsDebt.utilizationPct / 100) * 360}deg, #F3F1EA 0deg)`,
                    }}
                  >
                    <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-sm font-semibold text-text-main">
                      {data.cardsDebt.utilizationPct}%
                    </div>
                  </div>
                </div>
                <div className="grid gap-2 rounded-xl border border-app-border bg-app-surfaceSoft p-3">
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
                        <p className="text-sm font-semibold text-text-main truncate">{payment.name}</p>
                        <p className="text-xs text-text-muted">
                          ... {payment.last4} - {payment.dueText}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-text-main tabular-nums">
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
              <div className="grid gap-2.5 p-5">
                {data.savingsGoals.length === 0 ? (
                  <p className="rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                    No active savings goals yet.
                  </p>
                ) : null}
                {data.savingsGoals.map((goal) => (
                  <article
                    key={goal.name}
                    className="grid grid-cols-[32px_minmax(0,1fr)] gap-2 rounded-xl border border-app-border bg-app-surfaceSoft p-3"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EAF8EF] text-xs font-semibold text-[#1D8E4B]">
                      {getInitials(goal.name)}
                    </span>
                    <div className="min-w-0 grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-text-main">{goal.name}</p>
                        <p className="text-xs font-semibold text-text-muted">{goal.progress}%</p>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                        <div
                          className="h-full rounded-full bg-status-success"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <p
                        className="text-xs text-text-muted tabular-nums"
                        title={`${formatCurrency(goal.current)} / ${formatCurrency(goal.target)}`}
                      >
                        {formatCompactCurrency(goal.current)} / {formatCompactCurrency(goal.target)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </Card>
          </div>

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
                <p className="rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                  No alerts right now.
                </p>
              ) : null}
              <div className="grid gap-3 md:grid-cols-3">
              {visibleAlerts.map((alert) => (
                <article
                  key={alert.title}
                  className="rounded-xl border border-app-border bg-app-surfaceSoft p-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full ${
                        alert.tone === "danger"
                          ? "bg-status-dangerBg text-status-danger"
                          : "bg-status-warningBg text-status-warningDark"
                      }`}
                    >
                      {alert.tone === "danger" ? <AlertTriangle size={16} /> : <CalendarClock size={16} />}
                    </span>
                    <div className="min-w-0">
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
                    </div>
                  </div>
                </article>
              ))}
              </div>
              {remainingAlertCount > 0 ? (
                <p className="text-xs font-medium text-text-muted">
                  +{remainingAlertCount} more items need attention
                </p>
              ) : null}
            </div>
          </Card>
        </div>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-app-border p-5">
              <h3 className="text-base font-semibold text-text-main">Recent transactions</h3>
              <button
                type="button"
                className="text-sm font-semibold text-brand-primary"
                onClick={() => navigateToView("spending")}
              >
                View all
              </button>
            </div>
            <div className="grid gap-0 p-4">
              {data.recentTransactions.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-2 text-sm text-text-muted">
                  No recent transactions for this month.
                </p>
              ) : null}
              {data.recentTransactions.map((tx) => {
                const positive = tx.amount > 0;
                return (
                  <article
                    key={`${tx.merchant}-${tx.dateLabel}`}
                    className="grid grid-cols-[34px_minmax(0,1fr)_auto] items-center gap-3 border-b border-app-border px-1 py-2.5 last:border-b-0"
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
                        className={`text-sm font-semibold tabular-nums ${positive ? "text-status-successDark" : "text-text-main"}`}
                        title={formatCurrency(tx.amount)}
                      >
                        {formatCompactCurrency(tx.amount)}
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
              <button type="button" className="text-sm font-semibold text-brand-primary">Edit</button>
            </div>
            <div className="p-5">
              <blockquote className="rounded-xl border border-[#F2DFC2] bg-[#FFF9F1] px-4 py-3 text-sm italic text-text-soft">
                <Quote size={16} className="mb-2 text-[#D29B3D]" />
                "{data.familyNote.quote}"
                <footer className="mt-2 text-xs font-semibold not-italic text-text-muted">
                  - {data.familyNote.author}
                </footer>
                <div className="mt-2 flex justify-end">
                  <button type="button" className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E9D4AD] text-[#9A7A3A]">
                    <Heart size={14} />
                  </button>
                </div>
              </blockquote>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-base font-semibold text-text-main">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-4">
              {data.quickActions.map((action) => {
                const Icon = actionIcons[action.icon] ?? Calendar;
                return (
                  <button
                    key={action.label}
                    type="button"
                    className="grid place-items-center gap-2 rounded-xl border border-app-border bg-app-surfaceSoft px-3 py-3 text-center transition hover:border-brand-primary/40 hover:bg-app-surface"
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

function getBudgetHealthRingTone(onTrackPct) {
  if (onTrackPct >= 70) return "#22A06B";
  if (onTrackPct >= 45) return "#EA7A0A";
  return "#DC2626";
}

function formatCompactCurrency(value) {
  const amount = Number(value || 0);
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `${amount < 0 ? "-" : ""}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 100_000) return `${amount < 0 ? "-" : ""}$${Math.round(abs / 1_000)}K`;
  return formatCurrency(amount);
}

function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "SG";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
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
