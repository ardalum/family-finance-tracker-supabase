import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import InfoTooltip from "../../../components/ui/InfoTooltip.jsx";
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

function Metric({ label, value, muted = false, helpText = "" }) {
  return (
    <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
        {helpText ? <InfoTooltip label={`${label} calculation info`} content={helpText} /> : null}
      </div>
      <p className={`mt-1 text-lg font-semibold ${muted ? "text-text-muted" : "text-text-main"}`}>
        {value}
      </p>
    </div>
  );
}

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

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">Financial Pulse</h3>
        {/* Legacy copy guard: Card purchases count toward spending and budgets. */}
        <p className="mt-1 text-sm text-text-muted">
          Cash position is your total tracked bank and cash account balance.
        </p>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Cash position"
          value={
            cashFlow.hasCashSnapshotData
              ? formatCurrency(cashFlow.cashPositionTotal)
              : "Add account snapshots"
          }
          muted={!cashFlow.hasCashSnapshotData}
          helpText="Total tracked bank/cash account balance for the selected month. Starts from account snapshots, then applies tracked money in/out movements. Excludes credit card limits, unpaid card balances, loans, and outside/untracked accounts."
        />
        <Metric
          label="Spending this month"
          value={formatCurrency(cashFlow.spendingTotal)}
          helpText="Transactions recorded for the selected month. Credit card purchases count as spending and budget activity, but do not reduce Cash Position until the card is paid from a tracked account."
        />
        <Metric label="Total budget" value={formatCurrency(cashFlow.budgetTotal)} />
        <Metric
          label="Budget remaining"
          value={formatCurrency(cashFlow.remainingBudget)}
          helpText="Monthly budget minus spending assigned to budget categories. This is a planning number, not the same as Cash Position."
        />
        <Metric
          label="Upcoming obligations"
          value={formatCurrency(cashFlow.upcomingObligationsTotal)}
        />
        <Metric
          label="Recurring bills remaining"
          value={formatCurrency(cashFlow.recurringRemaining)}
          muted={!cashFlow.hasRecurringRemaining}
        />
        <Metric
          label="Unpaid card payments"
          value={formatCurrency(cashFlow.unpaidCardBalanceTotal)}
          muted={!cashFlow.hasUnpaidCardObligations}
        />
        <Metric
          label="Savings this month"
          value={formatCurrency(cashFlow.savingsContributionTotal)}
          muted={!cashFlow.hasSavingsData}
        />
      </div>

      <div className="grid gap-1 px-4 pb-2 text-xs text-text-muted">
        {!cashFlow.hasCashSnapshotData ? <p>Add account snapshots to see cash position.</p> : null}
        {!cashFlow.hasBudgetData ? <p>Add budget categories to track budget remaining.</p> : null}
        {!cashFlow.hasUpcomingObligations ? (
          <p>No upcoming recurring or unpaid card obligations this month.</p>
        ) : null}
        {!cashFlow.hasSavingsData ? (
          <p>No savings contributions recorded for this month yet.</p>
        ) : null}
        <p>
          Planned cash cushion is a planning estimate: income - recurring remaining - unpaid card
          payments - savings. It is not an account balance.
        </p>
      </div>

      <div className="grid gap-3 px-4 pb-4 md:grid-cols-2">
        <Metric
          label="Income this month"
          value={
            cashFlow.hasIncomeData ? formatCurrency(cashFlow.incomeTotal) : "Add income entries"
          }
          muted={!cashFlow.hasIncomeData}
          helpText="Total income entries for the selected month. Only income deposited into a tracked account affects Cash Position."
        />
        <Metric
          label="Planned cash cushion"
          value={cashFlow.hasIncomeData ? formatCurrency(cashFlow.plannedCashCushion) : "Not ready"}
          muted={!cashFlow.hasIncomeData}
          helpText="Planning estimate based on expected income, remaining obligations, and savings. This is not your bank balance."
        />
      </div>

      <div className="grid gap-2 border-t border-app-border p-4 sm:grid-cols-2 xl:grid-cols-4">
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
