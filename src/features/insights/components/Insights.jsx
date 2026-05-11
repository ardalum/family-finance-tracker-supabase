import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import BudgetVsSpendingTable from "../../dashboard/components/BudgetVsSpendingTable.jsx";
import CreditCardPaymentOverview from "../../dashboard/components/CreditCardPaymentOverview.jsx";
import DashboardCharts from "../../dashboard/components/DashboardCharts.jsx";
import RecurringOverview from "../../dashboard/components/RecurringOverview.jsx";
import { getDashboardData } from "../../dashboard/dashboardUtils.js";
import InsightsSummaryCards from "./InsightsSummaryCards.jsx";

export default function Insights({
  appData,
  selectedMonth = getCurrentMonthKey(),
  onMonthChange,
  loading = false,
  error = "",
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);
  const topMerchants = useMemo(() => getTopMerchants(data.transactions), [data.transactions]);

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Insights month</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Reporting only. Manage records in their dedicated tabs.
            </p>
            {loading ? <p className="mt-2 text-sm text-text-muted">Loading insights...</p> : null}
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

      <InsightsSummaryCards summary={data.summary} />
      <DashboardCharts chartData={data.chartData} />

      <div className="grid gap-6">
        <BudgetVsSpendingTable rows={data.budgetRows} title="Budget vs Actual" />
        <CreditCardPaymentOverview
          rows={data.cardRows}
          totalUnpaid={data.summary.unpaidBalanceTotal}
          title="Credit Card Payment Insights"
        />
        <RecurringOverview
          rows={data.recurringRows}
          summary={data.recurringSummary}
          title="Recurring Payment Summary"
        />
        <TopMerchants merchants={topMerchants} />
      </div>
    </section>
  );
}

function TopMerchants({ merchants }) {
  return (
    <Card>
      <h3 className="border-b border-app-border p-5 text-lg font-semibold text-text-main">
        Top Merchants
      </h3>
      {merchants.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          No merchant spending for this month.
        </div>
      ) : (
        <div className="divide-y divide-app-border">
          {merchants.map((merchant, index) => (
            <div key={merchant.name} className="grid gap-2 px-5 py-4 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center">
              <span className="text-sm font-semibold text-text-muted">#{index + 1}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main" title={merchant.name}>
                  {merchant.name}
                </p>
                <p className="text-xs text-text-muted">
                  {merchant.count} transaction{merchant.count === 1 ? "" : "s"}
                </p>
              </div>
              <p className="text-sm font-semibold text-text-main">
                {formatCurrency(merchant.total)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function getTopMerchants(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const name = transaction.merchant || "Unknown merchant";
    const current = totals.get(name) ?? { name, total: 0, count: 0 };
    totals.set(name, {
      ...current,
      total: current.total + Number(transaction.amount || 0),
      count: current.count + 1,
    });
  });

  return Array.from(totals.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
}
