import { useMemo } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { summarizeFinancialPositionForMonth } from "../financialPositionService.js";

const sectionLinks = [
  {
    key: "income",
    title: "Income",
    buttonLabel: "Manage income",
    view: "income",
    target: "monthly-income",
  },
  {
    key: "savings",
    title: "Savings",
    buttonLabel: "Manage savings",
    view: "savings",
    target: "monthly-savings",
  },
  {
    key: "accounts",
    title: "Accounts",
    buttonLabel: "Manage accounts",
    view: "accounts",
    target: "monthly-account-snapshots",
  },
  {
    key: "liabilities",
    title: "Liabilities",
    buttonLabel: "Manage debts",
    view: "liabilities",
    target: "monthly-liability-snapshots",
  },
  {
    key: "net-worth",
    title: "Net Worth",
    buttonLabel: "Review net worth",
    view: "net-worth",
    target: "monthly-net-worth",
  },
];

export default function FinancialPosition({
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
  transactions = [],
  recurringPayments = [],
  recurringStatusByMonth = {},
  incomeEntries = [],
  savingsContributions = [],
  cashAccounts = [],
  accountBalanceSnapshots = [],
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
  liabilityReviewConfirmed = false,
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const summary = useMemo(
    () =>
      summarizeFinancialPositionForMonth({
        selectedMonth,
        transactions,
        recurringPayments,
        recurringStatusByMonth,
        incomeEntries,
        savingsContributions,
        cashAccounts,
        accountBalanceSnapshots,
        liabilityAccounts,
        liabilityBalanceSnapshots,
      }),
    [
      selectedMonth,
      transactions,
      recurringPayments,
      recurringStatusByMonth,
      incomeEntries,
      savingsContributions,
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
    ],
  );

  const needsUpdateItems = useMemo(() => {
    const items = [];
    if (summary.needsUpdate.income) items.push("No income entries for this month yet.");
    if (summary.needsUpdate.savings) items.push("No savings contributions for this month yet.");
    if (summary.needsUpdate.accounts)
      items.push("No account balance snapshots for this month yet.");
    if (summary.needsUpdate.liabilities && liabilityReviewConfirmed) {
      items.push("No liabilities confirmed for this month.");
    } else if (summary.needsUpdate.liabilities) {
      items.push("No liability snapshots for this month yet.");
    }
    if (summary.needsUpdate.netWorth) {
      items.push("Net worth review appears once account or liability snapshots are added.");
    }
    if (summary.needsUpdate.netWorthIncomplete && !liabilityReviewConfirmed) {
      items.push(
        "Net worth is partially computed until both account and liability snapshots exist.",
      );
    }
    return items;
  }, [liabilityReviewConfirmed, summary.needsUpdate]);

  return (
    <section className="grid gap-4 sm:gap-6">
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Financial position month</p>
            <h2 className="mt-1 text-xl font-semibold text-text-main sm:text-2xl">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Financial Position summarizes existing income, savings, cash, debt, and net worth
              data.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              This page does not change any totals. Net worth depends on manual account and debt
              snapshots.
            </p>
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

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-4 sm:p-5">
          <p className="text-sm text-text-muted">Loading financial position data...</p>
        </Card>
      ) : null}

      {!loading && !error && !summary.hasAnySummaryData ? (
        <EmptyState>
          {liabilityReviewConfirmed
            ? "No financial-position data found for this month yet. Add income, savings, or account snapshots to start your summary. No liabilities are confirmed for this month."
            : "No financial-position data found for this month yet. Add income, savings, account snapshots, or liability snapshots to start your summary."}
        </EmptyState>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Income this month" value={summary.incomeTotal} />
        <SummaryCard label="Savings this month" value={summary.savingsTotal} />
        <SummaryCard label="Liquid cash" value={summary.liquidCashTotal} />
        <SummaryCard label="Total debt" value={summary.totalDebt} />
        <SummaryCard label="Net worth" value={summary.netWorthSummary.netWorth} />
        <SummaryCard
          label="Estimated leftover"
          value={summary.cashFlowSummary.estimatedLeftover}
          note={
            summary.cashFlowSummary.hasIncomeData
              ? "Income - spending - recurring remaining - savings"
              : "Add income entries to make leftover fully meaningful."
          }
        />
      </div>

      <Card className="p-4 sm:p-5">
        <h3 className="text-base font-semibold text-text-main">Needs update</h3>
        <p className="mt-1 text-sm text-text-muted">
          Advisory only. Missing items do not block month close.
        </p>
        <div className="mt-3 grid gap-2 sm:mt-4">
          {needsUpdateItems.length === 0 ? (
            <EmptyState>All core financial-position inputs are present for this month.</EmptyState>
          ) : (
            <ul className="grid gap-2">
              {needsUpdateItems.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-app-border bg-app-background px-3 py-2.5"
                >
                  <p className="text-sm leading-6 text-text-main">{item}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        {sectionLinks.map((section) => (
          <Card key={section.key} className="p-4 sm:p-5">
            <h3 className="text-base font-semibold text-text-main">{section.title}</h3>
            <p className="mt-1 text-sm text-text-muted">
              {getSectionSummary(section.key, summary)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => dispatchNavigation(section.view, section.target)}
              >
                {section.buttonLabel}
              </Button>
            </div>
          </Card>
        ))}
        <Card className="p-4 sm:p-5">
          <h3 className="text-base font-semibold text-text-main">Insights</h3>
          <p className="mt-1 text-sm text-text-muted">
            Open trends for YTD, year-over-year, and net worth changes over time.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => dispatchNavigation("insights")}
            >
              View trends
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, note = "" }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-text-main sm:mt-2 sm:text-3xl">
        {formatCurrency(value)}
      </p>
      {note ? <p className="mt-1 text-xs leading-5 text-text-muted">{note}</p> : null}
    </Card>
  );
}

function getSectionSummary(sectionKey, summary) {
  if (sectionKey === "income") {
    return `Tracked this month: ${formatCurrency(summary.incomeTotal)}.`;
  }
  if (sectionKey === "savings") {
    return `Tracked contributions this month: ${formatCurrency(summary.savingsTotal)}.`;
  }
  if (sectionKey === "accounts") {
    return `Liquid cash from snapshots: ${formatCurrency(summary.liquidCashTotal)}.`;
  }
  if (sectionKey === "liabilities") {
    return `Tracked debt from snapshots: ${formatCurrency(summary.totalDebt)}.`;
  }
  if (sectionKey === "net-worth") {
    return `Current net worth from snapshots: ${formatCurrency(summary.netWorthSummary.netWorth)}.`;
  }
  return "";
}

FinancialPosition.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
