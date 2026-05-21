import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Goal,
  ReceiptText,
  Repeat,
  Search,
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

const dashboardSections = [
  {
    id: "attention",
    label: "Focus",
    description: "Cards, budgets, and bills that need action soon.",
    icon: AlertTriangle,
  },
  {
    id: "activity",
    label: "Activity",
    description: "Recent spending and this month's movement.",
    icon: ReceiptText,
  },
  {
    id: "all-sections",
    label: "All",
    description: "Show attention items and recent activity together.",
    icon: BarChart3,
  },
];

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
  const [activeSection, setActiveSection] = useState("attention");
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);
  const alerts = useMemo(() => getAlerts(data), [data]);
  const monthlyCloseChecklist = useMemo(
    () => getMonthlyCloseChecklist(data, selectedMonth, monthlyCloseReview),
    [data, monthlyCloseReview, selectedMonth],
  );
  const priorityAlerts = alerts.slice(0, 5);
  const currentSection =
    dashboardSections.find((section) => section.id === activeSection) ?? dashboardSections[0];
  const cardAttentionRows = data.cardRows.filter(
    (row) => row.hasPaymentDue && row.daysUntilDue <= 7,
  );
  const budgetAttentionRows = data.budgetRows.filter(
    (row) => row.remaining < 0 || row.percentUsed >= 90,
  );
  const recurringAttentionRows = data.recurringRows.filter((row) =>
    ["Past due", "Due now", "Due soon"].includes(row.displayStatus),
  );
  const activeGoals = (appData?.savingsGoals ?? []).filter((goal) => goal.isActive !== false);

  const showAttention = activeSection === "attention" || activeSection === "all-sections";
  const showActivity = activeSection === "activity" || activeSection === "all-sections";

  return (
    <section className="grid gap-6">
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/50">
        <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-app-border bg-white px-3 py-1 text-xs font-semibold text-text-muted">
              <WalletCards size={14} aria-hidden="true" />
              Family dashboard workspace
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-text-main sm:text-3xl">
                {formatMonthLabel(selectedMonth)}
              </h2>
              <p className="mt-1 text-sm text-text-muted">Cash flow, budgets, bills, and goals in one view.</p>
            </div>
            {loading ? <p className="text-sm text-text-muted">Loading dashboard data...</p> : null}
            {error ? <p className="text-sm font-medium text-status-danger">{error}</p> : null}
          </div>
          <div className="grid gap-2 text-sm text-text-muted sm:text-right">
            <p>
              Active month: <span className="font-semibold text-text-main">{formatMonthLabel(selectedMonth)}</span>
            </p>
            <p>Use the top toolbar to switch month, search, and add transactions.</p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-app-border/80 bg-white/60 p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-app-border bg-white px-3 text-sm text-text-muted">
            <Search size={16} aria-hidden="true" />
            <span className="truncate">Search (mockup preview only)</span>
            <span className="ml-auto rounded-md bg-app-muted px-2 py-0.5 text-xs font-semibold">Soon</span>
          </label>
          <div className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-text-muted">
            <Bell size={16} aria-hidden="true" />
            Alerts: {alerts.length}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
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

          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetVsSpendingTable
              rows={data.budgetRows}
              title="Budget health"
              emptyMessage="No budget categories yet for this month."
            />
            <CreditCardPaymentOverview
              rows={data.cardRows}
              totalUnpaid={data.summary.unpaidBalanceTotal}
              title="Cards and debt"
              emptyMessage="No active credit cards available."
            />
          </div>

          <RecurringOverview
            rows={data.recurringRows}
            summary={data.recurringSummary}
            title="Upcoming bills"
            emptyMessage="No recurring bills for this month."
          />

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

        <div className="grid gap-6">
          <RecentTransactionsTable
            transactions={data.recentTransactions}
            cards={data.cards}
            categories={data.budgets}
          />
          <SavingsGoalsPanel goals={activeGoals} />
          <DashboardPriorityPanel alerts={priorityAlerts} totalAlertCount={alerts.length} />
          <FamilyNotePlaceholder />
          <DashboardQuickActions />
        </div>
      </div>

      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-text-main">Dashboard workspace</h2>
        <p className="text-sm text-text-muted">{currentSection.description}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-app-border bg-app-surface p-2">
        <div className="flex min-w-max gap-2">
          {dashboardSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-text-main text-white shadow-sm"
                    : "text-text-soft hover:bg-app-muted hover:text-text-main"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={16} aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {showAttention ? (
        <div>
          <h3 className="mb-3 text-lg font-semibold text-text-main">Needs attention</h3>
          <div className="grid gap-6 xl:grid-cols-2">
            <CreditCardPaymentOverview
              rows={cardAttentionRows}
              totalUnpaid={data.summary.unpaidBalanceTotal}
              title="Credit cards to pay"
              emptyMessage="No credit cards are due soon or past due."
            />
            <BudgetVsSpendingTable
              rows={budgetAttentionRows}
              title="Budget attention"
              emptyMessage="No categories are over budget or near the limit."
            />
          </div>
          <div className="mt-6">
            <RecurringOverview
              rows={recurringAttentionRows}
              summary={data.recurringSummary}
              title="Recurring bills to pay"
              emptyMessage="No recurring bills are due soon or past due."
            />
          </div>
        </div>
      ) : null}

      {showActivity ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <RecentTransactionsTable
            transactions={data.recentTransactions}
            cards={data.cards}
            categories={data.budgets}
          />
          <DashboardActivitySummary data={data} />
        </div>
      ) : null}
    </section>
  );
}

function DashboardQuickActions() {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">Quick actions</h3>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">
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
      <Card className="border-status-successBg bg-status-successBg/40 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 rounded-full bg-white p-2 text-status-successDark shadow-sm">
            <CheckCircle2 size={18} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-text-main">No urgent dashboard alerts</h3>
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
          <h3 className="text-base font-semibold text-text-main">Top alerts</h3>
          <p className="mt-1 text-sm text-text-muted">
            Showing {alerts.length} of {totalAlertCount} item{totalAlertCount === 1 ? "" : "s"}.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-status-warningBg px-3 py-1 text-sm font-semibold text-status-warningDark">
          <AlertTriangle size={16} aria-hidden="true" />
          {totalAlertCount} alert{totalAlertCount === 1 ? "" : "s"}
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
          Motivational notes and shared comments are UI-only placeholders for now.
        </p>
      </div>
    </Card>
  );
}

function DashboardActivitySummary({ data }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-full bg-app-background p-2 text-text-muted ring-1 ring-inset ring-app-border">
          <Clock3 size={18} aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-text-main">Month activity snapshot</h3>
          <p className="mt-1 text-sm text-text-muted">
            Current month totals based on budget, spending, recurring bills, and unpaid card balances.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ActivityMetric label="Budget remaining" value={data.summary.remainingBudget} />
        <ActivityMetric label="Recurring remaining" value={data.summary.recurringRemaining} />
        <ActivityMetric label="Unpaid card balance" value={data.summary.unpaidBalanceTotal} />
        <ActivityMetric label="Transactions shown" value={data.recentTransactions.length} isCount />
      </div>
    </Card>
  );
}

function ActivityMetric({ label, value, isCount = false }) {
  const isNegativeMoney = !isCount && Number(value) < 0;
  return (
    <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${isNegativeMoney ? "text-status-danger" : "text-text-main"}`}
      >
        {isCount ? value : formatCurrency(value)}
      </p>
    </div>
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
