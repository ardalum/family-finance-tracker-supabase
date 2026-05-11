import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import BudgetVsSpendingTable from "./BudgetVsSpendingTable.jsx";
import CreditCardPaymentOverview from "./CreditCardPaymentOverview.jsx";
import DashboardCharts from "./DashboardCharts.jsx";
import DashboardSummaryCards from "./DashboardSummaryCards.jsx";
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

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">Dashboard month</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              A monthly overview calculated from your existing tracker data.
            </p>
            {loading ? <p className="mt-2 text-sm text-gray-500">Loading dashboard data...</p> : null}
            {error ? <p className="mt-2 text-sm font-medium text-red-700">{error}</p> : null}
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

      <DashboardSummaryCards summary={data.summary} />
      <DashboardCharts chartData={data.chartData} />

      <div className="grid gap-6">
        <BudgetVsSpendingTable rows={data.budgetRows} />
        <CreditCardPaymentOverview rows={data.cardRows} totalUnpaid={data.summary.unpaidBalanceTotal} />
        <RecurringOverview rows={data.recurringRows} summary={data.recurringSummary} />
        <RecentTransactionsTable
          transactions={data.recentTransactions}
          cards={data.cards}
          categories={data.budgets}
        />
      </div>
    </section>
  );
}
