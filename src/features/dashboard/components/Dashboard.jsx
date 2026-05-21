import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Goal,
  ReceiptText,
  Repeat,
  Wrench,
  WalletCards,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import FeatureIcon from "../../../components/ui/FeatureIcon.jsx";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import BudgetVsSpendingTable from "./BudgetVsSpendingTable.jsx";
import CreditCardPaymentOverview from "./CreditCardPaymentOverview.jsx";
import DashboardCashFlowSummary from "./DashboardCashFlowSummary.jsx";
import MonthlyCloseChecklist from "./MonthlyCloseChecklist.jsx";
import RecentTransactionsTable from "./RecentTransactionsTable.jsx";
import RecurringOverview from "./RecurringOverview.jsx";
import { getAlerts, getDashboardData } from "../dashboardUtils.js";
import { getMonthlyCloseChecklist } from "../monthlyCloseChecklist.js";

const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";

const quickActions = [
  {
    label: "Add transaction",
    description: "Record a new expense or income item.",
    view: "spending",
    target: "add-transaction",
    icon: ReceiptText,
    iconVariant: "orange",
  },
  {
    label: "Review budgets",
    description: "Check category usage and monthly limits.",
    view: "budgets",
    target: "budget-table",
    icon: WalletCards,
    iconVariant: "emerald",
  },
  {
    label: "Manage cards",
    description: "Update balances and upcoming payments.",
    view: "credit-cards",
    target: "monthly-balances",
    icon: CreditCard,
    iconVariant: "violet",
  },
  {
    label: "Review bills",
    description: "Open recurring bills for this month.",
    view: "recurring",
    target: "this-month",
    icon: Repeat,
    iconVariant: "rose",
  },
  {
    label: "Manage goals",
    description: "Track progress toward savings goals.",
    view: "savings",
    target: "monthly-savings",
    icon: Goal,
    iconVariant: "teal",
  },
  {
    label: "Tools",
    description: "Planning, setup, and maintenance tools.",
    view: "tools",
    target: "tools-home",
    icon: Wrench,
    iconVariant: "indigo",
  },
];

export default function Dashboard({
  appData,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  monthlyCloseReview,
  monthlyCloseReviewLoading = false,
  monthlyCloseReviewSaving = false,
  monthlyCloseReviewError = "",
  onToggleMonthlyCloseManualCheck,
  onMarkMonthlyCloseReviewed,
  onReopenMonthlyCloseReview,
}) {
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);
  const alerts = useMemo(() => getAlerts(data), [data]);
  const monthlyCloseChecklist = useMemo(
    () => getMonthlyCloseChecklist(data, selectedMonth, monthlyCloseReview),
    [data, monthlyCloseReview, selectedMonth],
  );
  const activeGoals = (appData?.savingsGoals ?? []).filter((goal) => goal.isActive !== false);

  return (
    <section className="grid gap-5 lg:gap-6">
      <Card className="border-app-border/80 bg-white/90 px-4 py-4 sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] text-text-muted">Overview</p>
            <h2 className="text-xl font-semibold tracking-tight text-text-main sm:text-2xl">
              {formatMonthLabel(selectedMonth)} dashboard
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-app-muted px-3 py-1.5 text-xs font-semibold text-text-soft">
            <Clock3 size={14} aria-hidden="true" />
            {loading ? "Refreshing data..." : "Live household snapshot"}
          </div>
        </div>
        {error ? <p className="mt-2 text-sm font-medium text-status-danger">{error}</p> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCashFlowSummary
              selectedMonth={selectedMonth}
              incomeEntries={appData.incomeEntries}
              savingsContributions={appData.savingsContributions}
              cashAccounts={appData.cashAccounts}
              accountBalanceSnapshots={appData.accountBalanceSnapshots}
              accountMoneyMovements={appData.accountMoneyMovements}
              budgetTotal={data.summary.budgetTotal}
              remainingBudget={data.summary.remainingBudget}
              spendingTotal={data.summary.spendingTotal}
              recurringRemaining={data.summary.recurringRemaining}
              unpaidCardBalanceTotal={data.summary.unpaidBalanceTotal}
            />
            <BudgetVsSpendingTable
              rows={data.budgetRows}
              title="Budget health"
              emptyMessage="No budget categories yet for this month."
            />
            <RecurringOverview
              rows={data.recurringRows}
              summary={data.recurringSummary}
              title="Upcoming bills"
              emptyMessage="No recurring bills for this month."
            />
            <CreditCardPaymentOverview
              rows={data.cardRows}
              totalUnpaid={data.summary.unpaidBalanceTotal}
              title="Cards & debt"
              emptyMessage="No active credit cards available."
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <SavingsGoalsPanel goals={activeGoals} />
            <DashboardPriorityPanel alerts={alerts.slice(0, 6)} totalAlertCount={alerts.length} />
          </div>

          <MonthlyCloseChecklist
            monthKey={selectedMonth}
            checklist={monthlyCloseChecklist}
            onNavigate={navigateToView}
            reviewLoading={monthlyCloseReviewLoading}
            reviewSaving={monthlyCloseReviewSaving}
            reviewError={monthlyCloseReviewError}
            onToggleManualCheck={onToggleMonthlyCloseManualCheck}
            onMarkReviewed={onMarkMonthlyCloseReviewed}
            onReopenReview={onReopenMonthlyCloseReview}
          />
        </div>

        <div className="grid gap-6 self-start">
          <RecentTransactionsTable
            transactions={data.recentTransactions}
            cards={data.cards}
            categories={data.budgets}
          />
          <FamilyNotePlaceholder />
          <DashboardQuickActions />
        </div>
      </div>
    </section>
  );
}

function DashboardQuickActions() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">Quick actions</h3>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-1">
        {quickActions.map((action) => {
          return (
            <button
              key={`${action.view}-${action.target}`}
              type="button"
              className="grid gap-2 rounded-2xl border border-app-border bg-app-surface p-4 text-left transition hover:border-brand-primary/40 hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onClick={() => navigateToView(action.view, action.target)}
            >
              <FeatureIcon icon={action.icon} variant={action.iconVariant} />
              <span className="text-sm font-semibold text-text-main">{action.label}</span>
              <span className="text-xs text-text-muted">{action.description}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function DashboardPriorityPanel({ alerts, totalAlertCount }) {
  if (totalAlertCount === 0) {
    return (
      <Card className="border-status-successBg bg-status-successBg/30 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-full bg-white p-2 text-status-successDark shadow-sm">
            <CheckCircle2 size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-text-main">No urgent alerts</h3>
            <p className="mt-1 text-sm text-text-muted">Cards, budgets, and recurring bills look clear.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-status-warningBg">
      <div className="grid gap-3 border-b border-app-border p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <h3 className="text-base font-semibold text-text-main">Needs attention</h3>
          <p className="mt-1 text-sm text-text-muted">
            Showing {alerts.length} of {totalAlertCount} active item{totalAlertCount === 1 ? "" : "s"}.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-status-warningBg px-3 py-1 text-sm font-semibold text-status-warningDark">
          <AlertTriangle size={16} aria-hidden="true" />
          {totalAlertCount}
        </span>
      </div>
      <div className="grid gap-2 p-4">
        {alerts.map((alert, index) => (
          <div
            key={`${alert.category}-${alert.text}-${index}`}
            className="rounded-xl border border-app-border bg-app-background px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${alert.type === "danger" ? "bg-status-dangerBg text-status-danger" : "bg-status-warningBg text-status-warningDark"}`}
              >
                {alert.type === "danger" ? "Urgent" : "Warning"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                {alert.category}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-text-main">{alert.text}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SavingsGoalsPanel({ goals }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-main">Savings goals</h3>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-dark"
            onClick={() => navigateToView("savings", "monthly-savings")}
          >
            View goals <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      {goals.length === 0 ? (
        <div className="p-5 text-sm text-text-muted">No savings goals added yet.</div>
      ) : (
        <div className="grid gap-4 p-4">
          {goals.slice(0, 3).map((goal) => {
            const target = Number(goal.targetAmount || 0);
            const current = Number(goal.currentAmount || 0);
            const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
            return (
              <article key={goal.id} className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-text-main">{goal.name}</p>
                  <p className="text-xs font-semibold text-text-muted">{Math.round(progress)}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-app-muted">
                  <div className="h-full rounded-full bg-status-success" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-text-muted">
                  {formatCurrency(current)} / {target > 0 ? formatCurrency(target) : "No target"}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function FamilyNotePlaceholder() {
  return (
    <Card className="overflow-hidden border-dashed">
      <div className="border-b border-app-border p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-text-main">Family note</h3>
          <span className="rounded-full bg-app-muted px-2 py-0.5 text-xs font-semibold text-text-muted">
            Placeholder
          </span>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-text-muted">
          Shared notes and encouragement are UI-only placeholders for now.
        </p>
      </div>
    </Card>
  );
}

function navigateToView(view, target = "") {
  try {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, view);
  } catch {
    // Navigation should still happen even if storage is unavailable.
  }

  dispatchNavigation(view, target);
}
