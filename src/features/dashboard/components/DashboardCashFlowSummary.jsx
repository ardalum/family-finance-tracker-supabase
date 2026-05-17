import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { getDashboardCashFlow } from "../dashboardCashFlow.js";

const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";

function navigateToView(view, target = "") {
  try {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, view);
  } catch {
    // Continue with event dispatch even when storage is unavailable.
  }
  dispatchNavigation(view, target);
}

function Metric({ label, value, muted = false }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${muted ? "text-text-muted" : "text-text-main"}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === "missing-income") {
    return (
      <span className="inline-flex w-fit rounded-full bg-status-warningBg px-3 py-1 text-xs font-semibold text-status-warningDark">
        Missing income data
      </span>
    );
  }

  if (status === "negative") {
    return (
      <span className="inline-flex w-fit rounded-full bg-status-dangerBg px-3 py-1 text-xs font-semibold text-status-danger">
        Negative cash flow
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full bg-status-successBg px-3 py-1 text-xs font-semibold text-status-successDark">
      Positive cash flow
    </span>
  );
}

export default function DashboardCashFlowSummary({
  selectedMonth,
  incomeEntries,
  savingsContributions,
  spendingTotal,
  recurringRemaining,
}) {
  const cashFlow = getDashboardCashFlow({
    selectedMonth,
    incomeEntries,
    savingsContributions,
    spendingTotal,
    recurringRemaining,
  });

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-text-main">Cash-flow summary</h3>
          <StatusBadge status={cashFlow.status} />
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Savings lowers available cash here, but does not count as spending.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Estimated leftover formula: Income - spending - recurring remaining - savings.
        </p>
        <p className="mt-1 text-xs text-text-muted">
          Unpaid card balances are not included in estimated leftover in this MVP.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Income this month" value={formatCurrency(cashFlow.incomeTotal)} />
        <Metric label="Spending this month" value={formatCurrency(cashFlow.spendingTotal)} />
        <Metric
          label="Savings this month"
          value={formatCurrency(cashFlow.savingsContributionTotal)}
        />
        <Metric label="Recurring remaining" value={formatCurrency(cashFlow.recurringRemaining)} />
        <Metric
          label="Estimated leftover"
          value={cashFlow.hasIncomeData ? formatCurrency(cashFlow.estimatedLeftover) : "Not ready"}
          muted={!cashFlow.hasIncomeData}
        />
      </div>

      {!cashFlow.hasIncomeData ? (
        <div className="px-4 pb-1 text-sm text-status-warningDark">
          Add income entries to calculate estimated leftover.
        </div>
      ) : null}
      {!cashFlow.hasSavingsData ? (
        <div className="px-4 pb-1 text-xs text-text-muted">
          No savings contributions recorded for this month yet.
        </div>
      ) : null}
      {!cashFlow.hasRecurringRemaining ? (
        <div className="px-4 pb-1 text-xs text-text-muted">
          No recurring bills remaining for this month.
        </div>
      ) : null}

      <div className="grid gap-2 p-4 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateToView("income", "monthly-income")}
        >
          Manage income
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateToView("savings", "monthly-savings")}
        >
          Manage savings
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateToView("spending", "add-transaction")}
        >
          Review spending
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigateToView("recurring", "this-month")}
        >
          Review bills
        </Button>
      </div>
    </Card>
  );
}
