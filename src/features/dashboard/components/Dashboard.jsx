import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Clock3, CreditCard, ListChecks, ReceiptText, Repeat, WalletCards } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import BudgetVsSpendingTable from "./BudgetVsSpendingTable.jsx";
import CreditCardPaymentOverview from "./CreditCardPaymentOverview.jsx";
import DashboardActionCards from "./DashboardActionCards.jsx";
import RecentTransactionsTable from "./RecentTransactionsTable.jsx";
import RecurringOverview from "./RecurringOverview.jsx";
import { getAlerts, getDashboardData } from "../dashboardUtils.js";

const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";

const dashboardSections = [
  {
    id: "attention",
    label: "Attention",
    description: "Cards, budgets, and bills that need action soon.",
    icon: AlertTriangle,
  },
  {
    id: "activity",
    label: "Activity",
    description: "Recent transactions and current month movement.",
    icon: ReceiptText,
  },
  {
    id: "all-sections",
    label: "All Sections",
    description: "Show attention items and recent activity together.",
    icon: BarChart3,
  },
];

const quickActions = [
  {
    label: "Update card balances",
    description: "Enter statement balances and mark cards paid.",
    view: "credit-cards",
    icon: CreditCard,
  },
  {
    label: "Add transactions",
    description: "Record spending, payments, refunds, or income.",
    view: "spending",
    icon: ReceiptText,
  },
  {
    label: "Open recurring bills",
    description: "Mark monthly bills paid, unpaid, or skipped.",
    view: "recurring",
    icon: Repeat,
  },
  {
    label: "Review budget",
    description: "Adjust categories and monthly budget amounts.",
    view: "budgets",
    icon: WalletCards,
  },
];

export default function Dashboard({
  appData,
  selectedMonth = getCurrentMonthKey(),
  onMonthChange,
  loading = false,
  error = "",
}) {
  const [activeSection, setActiveSection] = useState("attention");
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);
  const alerts = useMemo(() => getAlerts(data), [data]);
  const priorityAlerts = alerts.slice(0, 5);
  const currentSection = dashboardSections.find((section) => section.id === activeSection) ?? dashboardSections[0];
  const cardAttentionRows = data.cardRows.filter(
    (row) => row.hasPaymentDue && row.daysUntilDue <= 7,
  );
  const budgetAttentionRows = data.budgetRows.filter(
    (row) => row.remaining < 0 || row.percentUsed >= 90,
  );
  const recurringAttentionRows = data.recurringRows.filter(
    (row) => ["Past due", "Due now", "Due soon"].includes(row.displayStatus),
  );

  const showAttention = activeSection === "attention" || activeSection === "all-sections";
  const showActivity = activeSection === "activity" || activeSection === "all-sections";

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Dashboard month</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              What needs your attention right now.
            </p>
            {loading ? <p className="mt-2 text-sm text-text-muted">Loading dashboard data...</p> : null}
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

      <DashboardActionCards
        summary={data.summary}
        cardRows={data.cardRows}
        recurringRows={data.recurringRows}
        budgetRows={data.budgetRows}
      />

      <DashboardQuickActions />

      <DashboardPriorityPanel alerts={priorityAlerts} totalAlertCount={alerts.length} />

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
          <h3 className="mb-3 text-lg font-semibold text-text-main">Needs Attention</h3>
          <div className="grid gap-6 xl:grid-cols-2">
            <CreditCardPaymentOverview
              rows={cardAttentionRows}
              totalUnpaid={data.summary.unpaidBalanceTotal}
              title="Credit Cards To Pay"
              emptyMessage="No credit cards are due soon or past due."
            />
            <BudgetVsSpendingTable
              rows={budgetAttentionRows}
              title="Budget Attention"
              emptyMessage="No categories are over budget or near the limit."
            />
          </div>
          <div className="mt-6">
            <RecurringOverview
              rows={recurringAttentionRows}
              summary={data.recurringSummary}
              title="Recurring Bills To Pay"
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
        <p className="mt-1 text-sm text-text-muted">
          Jump to the workspace where you can fix the numbers.
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.view}
              type="button"
              className="grid gap-2 rounded-2xl border border-app-border bg-app-surface p-4 text-left transition hover:border-brand-primary/40 hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
              onClick={() => navigateToView(action.view)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-background text-text-main ring-1 ring-inset ring-app-border">
                <Icon size={18} aria-hidden="true" />
              </span>
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
            <p className="mt-1 text-sm text-text-muted">
              Cards, budgets, and recurring bills look clear for this month.
            </p>
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
            Showing {alerts.length} of {totalAlertCount} item{totalAlertCount === 1 ? "" : "s"} that need attention.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-status-warningBg px-3 py-1 text-sm font-semibold text-status-warningDark">
          <AlertTriangle size={16} aria-hidden="true" />
          {totalAlertCount} alert{totalAlertCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="grid gap-2 p-4">
        {alerts.map((alert, index) => (
          <div key={`${alert.category}-${alert.text}-${index}`} className="rounded-xl border border-app-border bg-app-background px-3 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${alert.type === "danger" ? "bg-status-dangerBg text-status-danger" : "bg-status-warningBg text-status-warningDark"}`}>
                {alert.type === "danger" ? "Urgent" : "Warning"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-normal text-text-muted">{alert.category}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-text-main">{alert.text}</p>
          </div>
        ))}
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
      <p className={`mt-1 text-lg font-semibold ${isNegativeMoney ? "text-status-danger" : "text-text-main"}`}>
        {isCount ? value : formatCurrency(value)}
      </p>
    </div>
  );
}

function navigateToView(view) {
  try {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, view);
    window.location.reload();
  } catch {
    window.location.reload();
  }
}
