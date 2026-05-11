import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import BudgetVsSpendingTable from "./BudgetVsSpendingTable.jsx";
import CreditCardPaymentOverview from "./CreditCardPaymentOverview.jsx";
import DashboardActionCards from "./DashboardActionCards.jsx";
import RecentTransactionsTable from "./RecentTransactionsTable.jsx";
import RecurringOverview from "./RecurringOverview.jsx";
import { getDashboardData } from "../dashboardUtils.js";

export default function Dashboard({
  appData,
  selectedMonth = getCurrentMonthKey(),
  onMonthChange,
  loading = false,
  error = "",
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);
  const cardAttentionRows = data.cardRows.filter(
    (row) => row.hasPaymentDue && row.daysUntilDue <= 7,
  );
  const budgetAttentionRows = data.budgetRows.filter(
    (row) => row.remaining < 0 || row.percentUsed >= 90,
  );
  const recurringAttentionRows = data.recurringRows.filter(
    (row) => ["Past due", "Due now", "Due soon"].includes(row.displayStatus),
  );

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
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <RecurringOverview
          rows={recurringAttentionRows}
          summary={data.recurringSummary}
          title="Recurring Bills To Pay"
          emptyMessage="No recurring bills are due soon or past due."
        />
        <RecentTransactionsTable
          transactions={data.recentTransactions}
          cards={data.cards}
          categories={data.budgets}
        />
      </div>
    </section>
  );
}
