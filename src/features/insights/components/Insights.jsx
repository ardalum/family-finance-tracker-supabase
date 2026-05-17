import { useMemo } from "react";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import HorizontalBarChart from "../../../components/ui/HorizontalBarChart.jsx";
import ProgressBar from "../../../components/ui/ProgressBar.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getDashboardData } from "../../dashboard/dashboardUtils.js";
import InsightsSummaryCards from "./InsightsSummaryCards.jsx";
import {
  calculateSharePercent,
  getBudgetInsights,
  getTopCategories,
  getTopMerchants,
  getTransactionTypeMixRows,
} from "../insightsChartData.js";
import { getYtdInsightsData } from "../insightsYtdUtils.js";
import { getYearOverYearInsightsData } from "../insightsYearComparisonUtils.js";

const BUDGET_STATUS_COPY = {
  over: {
    label: "Over budget",
    badge: "border-status-danger/30 bg-status-danger/10 text-status-danger",
  },
  near: {
    label: "Near limit",
    badge: "border-status-warning/30 bg-status-warning/10 text-status-warning",
  },
  safe: {
    label: "Safe",
    badge: "border-status-success/30 bg-status-success/10 text-status-success",
  },
  unused: {
    label: "No spending",
    badge: "border-app-border bg-app-soft text-text-muted",
  },
};

export default function Insights({
  appData,
  selectedMonth = getCurrentMonthKey(),
  onMonthChange,
  loading = false,
  error = "",
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const data = useMemo(() => getDashboardData(appData, selectedMonth), [appData, selectedMonth]);

  const budgetInsights = useMemo(() => getBudgetInsights(data.budgetRows), [data.budgetRows]);
  const categoryRows = useMemo(
    () => getTopCategories(data.chartData.spendingByCategory),
    [data.chartData.spendingByCategory],
  );
  const merchantRows = useMemo(() => getTopMerchants(data.transactions), [data.transactions]);
  const transactionTypeRows = useMemo(
    () => getTransactionTypeMixRows(data.transactions),
    [data.transactions],
  );
  const ytdData = useMemo(
    () =>
      getYtdInsightsData({
        selectedMonth,
        transactionsByMonth: appData.ytdTransactionsByMonth ?? {},
        budgetsByMonth: appData.ytdBudgetsByMonth ?? {},
        monthlyCloseReviewsByMonth: appData.monthlyCloseReviewsByMonth ?? null,
      }),
    [
      appData.monthlyCloseReviewsByMonth,
      appData.ytdBudgetsByMonth,
      appData.ytdTransactionsByMonth,
      selectedMonth,
    ],
  );
  const yearComparison = useMemo(
    () =>
      getYearOverYearInsightsData({
        selectedMonth,
        transactionsByMonth: appData.ytdTransactionsByMonth ?? {},
        budgetsByMonth: appData.ytdBudgetsByMonth ?? {},
      }),
    [appData.ytdBudgetsByMonth, appData.ytdTransactionsByMonth, selectedMonth],
  );

  const hasInsightData = data.transactions.length > 0 || data.budgets.length > 0;

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Insights month</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-text-muted">
              Reporting center for spending patterns, budget pressure, merchant concentration,
              transaction mix, and year-to-date progress using current tracked data.
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

      {!hasInsightData ? <InsightsEmptyState selectedMonth={selectedMonth} /> : null}

      <InsightsSummaryCards summary={data.summary} overBudgetCount={budgetInsights.over.length} />

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Spending by Category"
            description="Net category spending ranked highest to lowest for this month."
          />
          <div className="p-5">
            <HorizontalBarChart
              title="Spending by Category"
              description="Category spending bars with amount labels"
              items={categoryRows}
              valueLabel="Net spending"
              emptyMessage="No category spending for this month."
            />
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Top Merchants"
            description="Merchants with highest net spending this month, excluding non-spending transfer/payment effects."
          />
          <div className="p-5">
            <HorizontalBarChart
              title="Top Merchants"
              description="Merchant spending bars with amount and transaction counts"
              items={merchantRows}
              valueLabel="Net spending"
              emptyMessage="No merchant spending for this month."
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Budget Usage"
            description="Spent vs budget with clear status labels for over, near, and safe categories."
          />
          {budgetInsights.all.length === 0 ? (
            <EmptyPanel message="No budget categories for this month." />
          ) : (
            <div className="grid gap-4 p-5">
              <BudgetUsageGroup title="Over budget" rows={budgetInsights.over} />
              <BudgetUsageGroup title="Near limit" rows={budgetInsights.near} />
              <BudgetUsageGroup title="Under budget / safe" rows={budgetInsights.safe} />
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Transaction Type Mix"
            description="Shows entered amounts and net spending impact by transaction type (refunds reduce spend; payments/transfers/income have zero net spending impact)."
          />
          {transactionTypeRows.length === 0 ? (
            <EmptyPanel message="No transactions for this month." />
          ) : (
            <div className="grid gap-3 p-5">
              {transactionTypeRows.map((row) => (
                <TransactionTypeMixRow key={row.type} row={row} rows={transactionTypeRows} />
              ))}
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6">
        <Card>
          <SectionHeader
            title="YTD Review"
            description="Year-to-date reporting from January through the selected month using currently tracked transactions."
          />
          <div className="grid gap-5 p-5">
            {!ytdData.hasData ? (
              <EmptyState
                title="No YTD spending data yet."
                description="YTD reporting appears after transactions are added for the year."
              />
            ) : (
              <>
                <YtdSummaryCards ytdData={ytdData} />
                {ytdData.isPartialYear ? (
                  <p className="text-xs text-text-muted">
                    YTD is based on tracked data from January through the selected month.
                  </p>
                ) : null}
                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-1">
                    <h4 className="mb-2 text-sm font-semibold text-text-main">
                      YTD Spending by Month
                    </h4>
                    <HorizontalBarChart
                      title="YTD Spending by Month"
                      description="Year-to-date month-by-month spending totals"
                      items={ytdData.ytdSpendingByMonth.map((row) => ({
                        id: row.monthKey,
                        label: row.label,
                        value: row.value,
                        formattedValue: row.formattedValue,
                      }))}
                      valueLabel="Net spending"
                      emptyMessage="No YTD month data."
                      maxItems={12}
                    />
                  </div>
                  <div className="xl:col-span-1">
                    <h4 className="mb-2 text-sm font-semibold text-text-main">
                      YTD Spending by Category
                    </h4>
                    <HorizontalBarChart
                      title="YTD Spending by Category"
                      description="Year-to-date category totals"
                      items={ytdData.ytdSpendingByCategory}
                      valueLabel="Net spending"
                      emptyMessage="No YTD category spending yet."
                    />
                  </div>
                  <div className="xl:col-span-1">
                    <h4 className="mb-2 text-sm font-semibold text-text-main">Top Merchants YTD</h4>
                    <HorizontalBarChart
                      title="Top Merchants YTD"
                      description="Year-to-date top merchant spending totals"
                      items={ytdData.ytdTopMerchants}
                      valueLabel="Net spending"
                      emptyMessage="No YTD merchant spending yet."
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6">
        <Card>
          <SectionHeader
            title="Year-over-Year"
            description="Comparison with the same month and same YTD period from the previous year."
          />
          <div className="grid gap-5 p-5">
            {!yearComparison.hasPreviousYearData ? (
              <EmptyState description="Previous-year comparison will appear once you have tracked data for the same period last year." />
            ) : (
              <>
                {yearComparison.isPartialPreviousYear ? (
                  <p className="text-xs text-text-muted">
                    Comparison is based only on months with tracked data.
                  </p>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <ComparisonMetricCard
                    label="This Month vs Last Year"
                    currentLabel={yearComparison.selectedMonthComparison.labelCurrent}
                    currentValue={yearComparison.selectedMonthComparison.formattedCurrent}
                    previousLabel={yearComparison.selectedMonthComparison.labelPrevious}
                    previousValue={yearComparison.selectedMonthComparison.formattedPrevious}
                    delta={yearComparison.selectedMonthComparison.delta}
                  />
                  <ComparisonMetricCard
                    label="YTD vs Prior YTD"
                    currentLabel="Current YTD"
                    currentValue={yearComparison.ytdComparison.formattedCurrent}
                    previousLabel="Previous YTD"
                    previousValue={yearComparison.ytdComparison.formattedPrevious}
                    delta={yearComparison.ytdComparison.delta}
                  />
                  <ComparisonMetricCard
                    label="Average Monthly Spending"
                    currentLabel="Current YTD Avg"
                    currentValue={yearComparison.averageComparison.formattedCurrent}
                    previousLabel="Previous YTD Avg"
                    previousValue={yearComparison.averageComparison.formattedPrevious}
                    delta={yearComparison.averageComparison.delta}
                  />
                  <ComparisonTopCard
                    label="Top Comparisons"
                    topCategoryCurrent={yearComparison.topCategoryComparison.current}
                    topCategoryPrevious={yearComparison.topCategoryComparison.previous}
                    topMerchantCurrent={yearComparison.topMerchantComparison.current}
                    topMerchantPrevious={yearComparison.topMerchantComparison.previous}
                  />
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-text-main">Category Deltas</h4>
                    <HorizontalBarChart
                      title="Category Deltas"
                      description="Current YTD category spending values, with delta helper text versus prior YTD."
                      items={yearComparison.categoryDeltas.map((row) => ({
                        id: row.id,
                        label: row.label,
                        value: row.current,
                        formattedValue: row.formattedCurrent,
                        helperText: `Prev ${row.formattedPrevious} | Delta ${row.formattedDelta}`,
                      }))}
                      valueLabel="Current YTD"
                      emptyMessage="No comparable category data yet."
                    />
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-text-main">Merchant Deltas</h4>
                    <HorizontalBarChart
                      title="Merchant Deltas"
                      description="Current YTD merchant spending values, with delta helper text versus prior YTD."
                      items={yearComparison.merchantDeltas.map((row) => ({
                        id: row.id,
                        label: row.label,
                        value: row.current,
                        formattedValue: row.formattedCurrent,
                        helperText: `Prev ${row.formattedPrevious} | Delta ${row.formattedDelta}`,
                      }))}
                      valueLabel="Current YTD"
                      emptyMessage="No comparable merchant data yet."
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>
    </section>
  );
}

function InsightsEmptyState({ selectedMonth }) {
  return (
    <Card className="border-dashed">
      <EmptyState
        className="p-8"
        title={`No insight data for ${formatMonthLabel(selectedMonth)} yet.`}
        description="Add budgets and transactions for this month to unlock category, merchant, budget-usage, and transaction-type reporting."
      />
    </Card>
  );
}

function BudgetUsageGroup({ title, rows }) {
  return (
    <div className="rounded-2xl border border-app-border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-text-main">{title}</h4>
        <span className="rounded-full border border-app-border bg-app-soft px-2.5 py-1 text-xs font-semibold text-text-main">
          {rows.length}
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-text-muted">Nothing here right now.</p>
      ) : (
        <div className="grid gap-3">
          {rows.slice(0, 6).map((row) => {
            const copy = BUDGET_STATUS_COPY[row.status] ?? BUDGET_STATUS_COPY.safe;
            return (
              <div key={row.category} className="grid gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p
                      className="truncate text-sm font-semibold text-text-main"
                      title={row.category}
                    >
                      {row.category}
                    </p>
                    <p className="text-xs text-text-muted">
                      {formatCurrency(row.spent)} of {formatCurrency(row.budget)}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${copy.badge}`}
                  >
                    {copy.label}
                  </span>
                </div>
                <ProgressBar
                  value={row.spent}
                  max={row.budget}
                  label={row.category}
                  helperText={`${row.percentUsed.toFixed(0)}% used`}
                />
              </div>
            );
          })}
          {rows.length > 6 ? (
            <p className="text-xs text-text-muted">+{rows.length - 6} more</p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function TransactionTypeMixRow({ row, rows }) {
  const totalAbsImpact = rows.reduce((sum, current) => sum + Math.abs(current.netImpact), 0);
  const share = calculateSharePercent(Math.abs(row.netImpact), totalAbsImpact);

  return (
    <div className="rounded-xl border border-app-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main">{row.label}</p>
          <p className="text-xs text-text-muted">
            {row.count} transaction{row.count === 1 ? "" : "s"}
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-text-main">
          {formatCurrency(row.rawTotal)}
        </p>
      </div>
      <div className="mt-2">
        <ProgressBar
          value={Math.abs(row.netImpact)}
          max={totalAbsImpact}
          label={`${row.label} net impact share`}
          helperText={`Net impact ${formatCurrency(row.netImpact)} | ${share.toFixed(0)}% of total net impact`}
        />
      </div>
    </div>
  );
}

function YtdSummaryCards({ ytdData }) {
  const cards = [
    {
      label: "YTD Spending",
      value: formatCurrency(ytdData.ytdSpendingTotal),
    },
    {
      label: "Average Monthly Spending",
      value: formatCurrency(ytdData.averageMonthlySpending),
    },
    {
      label: "Highest Spending Month",
      value: ytdData.highestSpendingMonth
        ? `${ytdData.highestSpendingMonth.label} (${ytdData.highestSpendingMonth.formattedValue})`
        : "No spending yet",
    },
    {
      label: "Top Category YTD",
      value: ytdData.topCategoryYtd
        ? `${ytdData.topCategoryYtd.label} (${ytdData.topCategoryYtd.formattedValue})`
        : "No category data",
    },
    {
      label: "Top Merchant YTD",
      value: ytdData.topMerchantYtd
        ? `${ytdData.topMerchantYtd.label} (${ytdData.topMerchantYtd.formattedValue})`
        : "No merchant data",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-app-border bg-app-background p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {card.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-text-main">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function ComparisonMetricCard({
  label,
  currentLabel,
  currentValue,
  previousLabel,
  previousValue,
  delta,
}) {
  const deltaDirection =
    delta > 0
      ? "Higher than previous year"
      : delta < 0
        ? "Lower than previous year"
        : "No change vs previous year";
  const deltaText = `${delta >= 0 ? "+" : ""}${formatCurrency(delta)}`;

  return (
    <div className="rounded-xl border border-app-border bg-app-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-muted">
        {currentLabel}: <span className="font-semibold text-text-main">{currentValue}</span>
      </p>
      <p className="text-sm text-text-muted">
        {previousLabel}: <span className="font-semibold text-text-main">{previousValue}</span>
      </p>
      <p className="mt-1 text-xs font-semibold text-text-main">
        Delta {deltaText} ({deltaDirection})
      </p>
    </div>
  );
}

function ComparisonTopCard({
  label,
  topCategoryCurrent,
  topCategoryPrevious,
  topMerchantCurrent,
  topMerchantPrevious,
}) {
  return (
    <div className="rounded-xl border border-app-border bg-app-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
      <p className="mt-1 text-xs text-text-muted">
        Top Category (Current):{" "}
        <span className="font-semibold text-text-main">
          {topCategoryCurrent
            ? `${topCategoryCurrent.label} (${topCategoryCurrent.formattedValue})`
            : "No data"}
        </span>
      </p>
      <p className="text-xs text-text-muted">
        Top Category (Previous):{" "}
        <span className="font-semibold text-text-main">
          {topCategoryPrevious
            ? `${topCategoryPrevious.label} (${topCategoryPrevious.formattedValue})`
            : "No data"}
        </span>
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Top Merchant (Current):{" "}
        <span className="font-semibold text-text-main">
          {topMerchantCurrent
            ? `${topMerchantCurrent.label} (${topMerchantCurrent.formattedValue})`
            : "No data"}
        </span>
      </p>
      <p className="text-xs text-text-muted">
        Top Merchant (Previous):{" "}
        <span className="font-semibold text-text-main">
          {topMerchantPrevious
            ? `${topMerchantPrevious.label} (${topMerchantPrevious.formattedValue})`
            : "No data"}
        </span>
      </p>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="border-b border-app-border p-5">
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  );
}

function EmptyPanel({ message }) {
  return <EmptyState className="p-8" description={message} />;
}
