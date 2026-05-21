import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  CircleAlert,
  CircleDollarSign,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import DonutChart from "../../../components/charts/DonutChart.jsx";
import LineTrendChart from "../../../components/charts/LineTrendChart.jsx";
import StackedBarChart from "../../../components/charts/StackedBarChart.jsx";
import VerticalBarChart from "../../../components/charts/VerticalBarChart.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import HorizontalBarChart from "../../../components/ui/HorizontalBarChart.jsx";
import ProgressBar from "../../../components/ui/ProgressBar.jsx";
import Select from "../../../components/ui/Select.jsx";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { getDashboardData } from "../../dashboard/dashboardUtils.js";
import { getTransactionImpactAmount } from "../../spending/spendingService.js";
import {
  calculateSharePercent,
  getActionableInsightCards,
  getBudgetVsActualRows,
  getBudgetInsights,
  getMonthlyTrendRows,
  splitCompositionRowsIntoColumns,
  getTopCategories,
  getTopMerchants,
  getTransactionTypeMixRows,
} from "../insightsChartData.js";
import { getYtdInsightsData } from "../insightsYtdUtils.js";
import { getYearOverYearInsightsData } from "../insightsYearComparisonUtils.js";
import {
  buildNetWorthTrendRows,
  calculateNetWorthChange,
  getMonthKeysForRange,
  getNetWorthTrendStatus,
  summarizeAssetTrend,
  summarizeLiabilityTrend,
  summarizeNetWorthByMonth,
} from "../../netWorth/netWorthTrendService.js";

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
  liabilityReviewConfirmed = false,
}) {
  const [netWorthRangeMonths, setNetWorthRangeMonths] = useState("6");
  const [showDetailedReports, setShowDetailedReports] = useState(false);
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
  const netWorthMonthKeys = useMemo(
    () => getMonthKeysForRange(selectedMonth, Number(netWorthRangeMonths)),
    [selectedMonth, netWorthRangeMonths],
  );
  const netWorthByMonth = useMemo(
    () =>
      summarizeNetWorthByMonth({
        monthKeys: netWorthMonthKeys,
        cashAccounts: appData.cashAccounts ?? [],
        accountBalanceSnapshots: appData.accountBalanceSnapshots ?? [],
        liabilityAccounts: appData.liabilityAccounts ?? [],
        liabilityBalanceSnapshots: appData.liabilityBalanceSnapshots ?? [],
      }),
    [
      appData.accountBalanceSnapshots,
      appData.cashAccounts,
      appData.liabilityAccounts,
      appData.liabilityBalanceSnapshots,
      netWorthMonthKeys,
    ],
  );
  const netWorthTrendRows = useMemo(
    () => buildNetWorthTrendRows(netWorthByMonth),
    [netWorthByMonth],
  );
  const netWorthMonthsWithData = useMemo(
    () => netWorthByMonth.filter((row) => row.hasData && Number.isFinite(Number(row.netWorth))),
    [netWorthByMonth],
  );
  const currentNetWorth = netWorthMonthsWithData.at(-1)?.netWorth ?? null;
  const startingNetWorth = netWorthMonthsWithData[0]?.netWorth ?? null;
  const netWorthChange = calculateNetWorthChange(currentNetWorth, startingNetWorth);
  const netWorthTrendStatus = getNetWorthTrendStatus(netWorthChange);
  const assetTrend = useMemo(() => summarizeAssetTrend(netWorthByMonth), [netWorthByMonth]);
  const liabilityTrend = useMemo(() => summarizeLiabilityTrend(netWorthByMonth), [netWorthByMonth]);
  const bestMonth = useMemo(() => {
    if (netWorthMonthsWithData.length === 0) return null;
    return [...netWorthMonthsWithData].sort((a, b) => b.netWorth - a.netWorth)[0];
  }, [netWorthMonthsWithData]);
  const worstMonth = useMemo(() => {
    if (netWorthMonthsWithData.length === 0) return null;
    return [...netWorthMonthsWithData].sort((a, b) => a.netWorth - b.netWorth)[0];
  }, [netWorthMonthsWithData]);
  const hasAnyNetWorthSnapshots = netWorthByMonth.some((row) => row.hasData);
  const hasAnyLiabilitySnapshots = useMemo(
    () =>
      (appData.liabilityBalanceSnapshots ?? []).some(
        (snapshot) => snapshot?.monthKey === selectedMonth,
      ),
    [appData.liabilityBalanceSnapshots, selectedMonth],
  );
  const monthlyTrendRows = useMemo(
    () => getMonthlyTrendRows(ytdData.ytdSpendingByMonth ?? []),
    [ytdData.ytdSpendingByMonth],
  );
  const budgetVsActualRows = useMemo(
    () => getBudgetVsActualRows(budgetInsights.all ?? []),
    [budgetInsights.all],
  );
  const actionableCards = useMemo(
    () =>
      getActionableInsightCards({
        summary: data.summary,
        budgetInsights,
        merchantRows,
        categoryRows,
        ytdData,
        netWorthTrendStatus,
        hasNetWorthData: hasAnyNetWorthSnapshots,
        hasLiabilitySnapshots: hasAnyLiabilitySnapshots,
        liabilityReviewConfirmed,
      }),
    [
      budgetInsights,
      categoryRows,
      data.summary,
      hasAnyLiabilitySnapshots,
      hasAnyNetWorthSnapshots,
      merchantRows,
      netWorthTrendStatus,
      liabilityReviewConfirmed,
      ytdData,
    ],
  );

  const hasInsightData = data.transactions.length > 0 || data.budgets.length > 0;
  const previousMonthKey = useMemo(() => {
    const [year, month] = String(selectedMonth).split("-").map(Number);
    const shifted = new Date(year, month - 2, 1);
    return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
  }, [selectedMonth]);
  const previousMonthData = useMemo(
    () => getDashboardData(appData, previousMonthKey),
    [appData, previousMonthKey],
  );
  const spendingDelta = Number(data.summary.spendingTotal || 0) - Number(previousMonthData.summary.spendingTotal || 0);
  const spendingDeltaPercent = Number(previousMonthData.summary.spendingTotal || 0) > 0
    ? (spendingDelta / Number(previousMonthData.summary.spendingTotal || 1)) * 100
    : null;
  const budgetUsageRawPercent = Number(data.summary.budgetTotal || 0) > 0
    ? (Number(data.summary.spendingTotal || 0) / Number(data.summary.budgetTotal || 1)) * 100
    : 0;
  const budgetUsedPercent = Math.min(Math.max(budgetUsageRawPercent, 0), 100);
  const budgetBarTone =
    Number(data.summary.budgetTotal || 0) <= 0
      ? "bg-[#CBD5E1]"
      : budgetUsageRawPercent > 100
        ? "bg-status-danger"
        : budgetUsageRawPercent > 80
          ? "bg-status-warning"
          : "bg-status-success";
  const budgetDeltaPercent = Number(previousMonthData.summary.budgetTotal || 0) > 0
    ? budgetUsedPercent -
      Math.min(
        (Number(previousMonthData.summary.spendingTotal || 0) / Number(previousMonthData.summary.budgetTotal || 1)) * 100,
        100,
      )
    : null;
  const previousCategories = useMemo(
    () => getTopCategories(previousMonthData.chartData.spendingByCategory, 20),
    [previousMonthData.chartData.spendingByCategory],
  );
  const previousCategoryMap = useMemo(
    () => new Map(previousCategories.map((row) => [row.label, row.value])),
    [previousCategories],
  );
  const topCategoryChange = useMemo(() => {
    if (!categoryRows.length) return null;
    const deltas = categoryRows.map((row) => ({
      ...row,
      delta: row.value - (previousCategoryMap.get(row.label) ?? 0),
    }));
    return deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0] ?? null;
  }, [categoryRows, previousCategoryMap]);
  const incomeTotal = Number(data.summary.incomeTotal || 0);
  const netCashFlow = incomeTotal - Number(data.summary.spendingTotal || 0);
  const hasSpendingBaseline = spendingDeltaPercent !== null;
  const latestInsightCards = useMemo(() => {
    const defaultCards = [
      {
        id: "positive-default",
        title: "Great job staying on track!",
        explanation: "Your month is trending within budget in several categories.",
        action: "Review budgets",
        targetView: "budgets",
        tone: "positive",
      },
      {
        id: "warning-default",
        title: "Category pressure is building",
        explanation: "A few categories are close to their monthly limits.",
        action: "Review spending",
        targetView: "spending",
        tone: "warning",
      },
      {
        id: "attention-default",
        title: "Upcoming bills to watch",
        explanation: "Review upcoming obligations to protect cash flow.",
        action: "View bills",
        targetView: "recurring",
        tone: "attention",
      },
    ];
    if (!actionableCards.length) return defaultCards;
    return [0, 1, 2].map((index) => {
      const fallback = defaultCards[index];
      const source = actionableCards[index];
      if (!source) return fallback;
      return { ...fallback, ...source };
    });
  }, [actionableCards]);
  const chartCurrentRows = monthlyTrendRows.slice(-6);
  const chartPreviousRows = useMemo(() => {
    const [selectedYear] = String(selectedMonth).split("-").map(Number);
    return chartCurrentRows.map((row) => {
      const [yearString, monthString] = String(row.id).split("-");
      const monthNumber = Number(monthString);
      const previousMonthKeyForRow = `${Number(yearString || selectedYear) - 1}-${String(monthNumber).padStart(2, "0")}`;
      const previousValue = (appData.ytdTransactionsByMonth?.[previousMonthKeyForRow] ?? []).reduce(
        (sum, transaction) => sum + getTransactionImpactAmount(transaction),
        0,
      );
      return {
        id: previousMonthKeyForRow,
        label: formatMonthLabel(previousMonthKeyForRow).slice(0, 3),
        value: previousValue,
      };
    });
  }, [appData.ytdTransactionsByMonth, chartCurrentRows, selectedMonth]);
  const spendingBreakdownRows = categoryRows.slice(0, 6);
  const spendingBreakdownTotal = spendingBreakdownRows.reduce((sum, row) => sum + row.value, 0);
  const categoryColors = ["#198754", "#7CB342", "#F59E0B", "#EF4444", "#5C6AC4", "#94A3B8"];
  const groupCategorySpend = useMemo(() => {
    const groups = {
      needs: 0,
      wants: 0,
      savings: 0,
    };
    const classify = (name) => {
      const lower = String(name || "").toLowerCase();
      if (lower.includes("saving") || lower.includes("invest")) return "savings";
      if (
        lower.includes("rent") ||
        lower.includes("mortgage") ||
        lower.includes("utility") ||
        lower.includes("grocery") ||
        lower.includes("insurance") ||
        lower.includes("transport") ||
        lower.includes("gas")
      ) {
        return "needs";
      }
      return "wants";
    };
    categoryRows.forEach((row) => {
      const key = classify(row.label);
      groups[key] += Number(row.value || 0);
    });
    return groups;
  }, [categoryRows]);
  const previousGroupCategorySpend = useMemo(() => {
    const groups = {
      needs: 0,
      wants: 0,
      savings: 0,
    };
    const classify = (name) => {
      const lower = String(name || "").toLowerCase();
      if (lower.includes("saving") || lower.includes("invest")) return "savings";
      if (
        lower.includes("rent") ||
        lower.includes("mortgage") ||
        lower.includes("utility") ||
        lower.includes("grocery") ||
        lower.includes("insurance") ||
        lower.includes("transport") ||
        lower.includes("gas")
      ) {
        return "needs";
      }
      return "wants";
    };
    previousCategories.forEach((row) => {
      const key = classify(row.label);
      groups[key] += Number(row.value || 0);
    });
    return groups;
  }, [previousCategories]);

  return (
    <section className="grid gap-5">
      <div className="flex items-center justify-end gap-3">
        {loading ? <p className="text-xs text-text-muted">Loading insights…</p> : null}
        {error ? (
          <p className="rounded-lg border border-status-danger/30 bg-status-danger/10 px-2.5 py-1 text-xs font-medium text-status-danger">
            {error}
          </p>
        ) : null}
        <p className="inline-flex items-center gap-1 text-sm text-text-muted">
          Data refreshed recently <Info size={14} />
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#071F42]">
              Spending trend <Info size={13} className="text-text-muted" />
            </p>
            {!hasSpendingBaseline ? (
              <BarChart3 size={16} className="text-text-muted" />
            ) : spendingDelta <= 0 ? (
              <TrendingDown size={16} className="text-status-success" />
            ) : (
              <TrendingUp size={16} className="text-status-warningDark" />
            )}
          </div>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[#071F42]">
            {formatCurrency(data.summary.spendingTotal || 0)}
          </p>
          <p className="text-sm text-text-muted">This month</p>
          <p
            className={`mt-2 text-sm font-medium ${
              !hasSpendingBaseline
                ? "text-text-muted"
                : spendingDelta <= 0
                  ? "text-status-success"
                  : "text-status-warningDark"
            }`}
          >
            {hasSpendingBaseline ? (
              spendingDelta <= 0 ? (
                <ArrowDown size={14} className="mr-1 inline-block" />
              ) : (
                <ArrowUp size={14} className="mr-1 inline-block" />
              )
            ) : null}
            {hasSpendingBaseline
              ? `${Math.abs(spendingDeltaPercent).toFixed(1)}% vs ${formatMonthLabel(previousMonthKey)}`
              : "No prior-month baseline"}
          </p>
          <Sparkline
            values={chartCurrentRows.map((row) => row.value)}
            tone={!hasSpendingBaseline ? "navy" : spendingDelta <= 0 ? "green" : "red"}
          />
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#071F42]">
            Budget performance <Info size={13} className="text-text-muted" />
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[#071F42]">
            {Math.round(budgetUsedPercent)}%
          </p>
          <p className="text-sm text-text-muted">
            {Number(data.summary.budgetTotal || 0) <= 0
              ? "No monthly budget"
              : budgetUsageRawPercent > 100
                ? "Over budget"
                : budgetUsageRawPercent > 80
                  ? "Near budget"
                  : "On track"}
          </p>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-app-muted">
              <div
                className={`h-2 rounded-full ${budgetBarTone}`}
                style={{ width: `${budgetUsedPercent}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-text-muted">
            {formatCurrency(data.summary.spendingTotal || 0)} of {formatCurrency(data.summary.budgetTotal || 0)} budgeted
          </p>
          <p className={`mt-1 text-sm font-medium ${Number(budgetDeltaPercent || 0) <= 0 ? "text-status-success" : "text-status-warning"}`}>
            {budgetDeltaPercent === null ? "No previous-month budget baseline" : `${budgetDeltaPercent > 0 ? "+" : ""}${budgetDeltaPercent.toFixed(0)}pp vs ${formatMonthLabel(previousMonthKey)}`}
          </p>
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#071F42]">
            Category change <Info size={13} className="text-text-muted" />
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#071F42]">
            {topCategoryChange ? `${topCategoryChange.delta >= 0 ? "+" : ""}${formatCurrency(topCategoryChange.delta)}` : formatCurrency(0)}
          </p>
          <p
            className={`text-sm ${
              !topCategoryChange
                ? "text-text-muted"
                : topCategoryChange.delta > 0
                  ? "text-status-warningDark"
                  : "text-status-success"
            }`}
          >
            {topCategoryChange
              ? `${topCategoryChange.delta >= 0 ? "Increase" : "Decrease"} vs ${formatMonthLabel(previousMonthKey)}`
              : "No category comparison yet"}
          </p>
          <p className="mt-8 text-sm text-text-muted">
            {topCategoryChange ? `Top change: ${topCategoryChange.label} (${topCategoryChange.formattedValue})` : "Add more monthly spending history"}
          </p>
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <p className="inline-flex items-center gap-1 text-sm font-semibold text-[#071F42]">
            Cash flow insight <Info size={13} className="text-text-muted" />
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[#071F42]">
            {formatCurrency(netCashFlow)}
          </p>
          <p className="text-sm text-text-muted">Estimated cash left</p>
          <p
            className={`mt-4 inline-flex items-center gap-2 text-sm font-medium ${
              netCashFlow >= 0 ? "text-status-success" : "text-status-warningDark"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                netCashFlow >= 0 ? "bg-status-success" : "bg-status-warning"
              }`}
            />
            {netCashFlow >= 0 ? "Healthy" : "Watch"}
          </p>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_1.05fr_1fr]">
        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#071F42]">
            Spending breakdown <Info size={15} className="text-text-muted" />
          </h3>
          <p className="mt-1 text-sm text-text-muted">Where your money went this month</p>
          {spendingBreakdownRows.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-app-border bg-app-background p-4 text-sm text-text-muted">
              No category spending yet.
            </div>
          ) : (
            <>
              <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-app-muted">
                {spendingBreakdownRows.map((row, index) => (
                  <span
                    key={row.id}
                    style={{
                      width: `${Math.max(calculateSharePercent(row.value, spendingBreakdownTotal), 3)}%`,
                      backgroundColor: categoryColors[index % categoryColors.length],
                    }}
                  />
                ))}
              </div>
              <div className="mt-4 grid gap-1.5">
                <div className="grid grid-cols-[minmax(0,1fr)_110px_80px] items-center gap-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <span>Category</span>
                  <span className="text-right">Amount</span>
                  <span className="text-right">% of total</span>
                </div>
                {spendingBreakdownRows.map((row, index) => (
                  <div key={`breakdown-${row.id}`} className="grid grid-cols-[minmax(0,1fr)_110px_80px] items-center gap-3 text-sm">
                    <p className="inline-flex min-w-0 items-center gap-2 text-text-main">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                      <span className="truncate">{row.label}</span>
                    </p>
                    <p className="text-right font-medium text-[#071F42]">{formatCurrency(row.value)}</p>
                    <p className="text-right font-medium text-text-muted">{calculateSharePercent(row.value, spendingBreakdownTotal).toFixed(0)}%</p>
                  </div>
                ))}
                <div className="mt-2 border-t border-app-border pt-2">
                  <div className="grid grid-cols-[minmax(0,1fr)_110px_80px] items-center gap-3 text-sm font-semibold text-[#071F42]">
                    <span>Total</span>
                    <span className="text-right">{formatCurrency(Number(data.summary.spendingTotal || 0))}</span>
                    <span className="text-right">100%</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight text-[#071F42]">
            Spending over time <Info size={15} className="text-text-muted" />
          </h3>
          <div className="mt-3 inline-flex items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 text-[#071F42]"><span className="h-0.5 w-6 bg-[#102A63]" />This year</span>
            <span className="inline-flex items-center gap-1 text-text-muted"><span className="h-0.5 w-6 border-t border-dashed border-text-muted" />Last year</span>
          </div>
          <DualLineMiniChart currentRows={chartCurrentRows} previousRows={chartPreviousRows} />
          <div className="mt-4 border-t border-app-border pt-3">
            <p className="text-sm text-text-muted">Average monthly spending</p>
            <div className="mt-1 flex items-end gap-6">
              <div>
                <p className="text-2xl font-semibold text-[#071F42]">
                  {formatCurrency(chartCurrentRows.length ? chartCurrentRows.reduce((sum, row) => sum + row.value, 0) / chartCurrentRows.length : 0)}
                </p>
                <p className="text-xs text-text-muted">This year</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#667085]">
                  {formatCurrency(chartPreviousRows.length ? chartPreviousRows.reduce((sum, row) => sum + row.value, 0) / chartPreviousRows.length : 0)}
                </p>
                <p className="text-xs text-text-muted">Last year</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#071F42]">
            Month-over-month comparison <Info size={15} className="text-text-muted" />
          </h3>
          <div className="mt-4 rounded-xl border border-app-border">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col style={{ width: "34%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "22%" }} />
              </colgroup>
              <thead className="bg-app-background text-text-muted">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-medium">Metric</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">{formatMonthLabel(previousMonthKey)}</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">{formatMonthLabel(selectedMonth)}</th>
                  <th className="px-2 py-2 text-right text-xs font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                <ComparisonRow label="Total spending" current={Number(data.summary.spendingTotal || 0)} previous={Number(previousMonthData.summary.spendingTotal || 0)} trend="lower-better" />
                <ComparisonRow label="Needs" current={groupCategorySpend.needs} previous={previousGroupCategorySpend.needs} trend="lower-better" />
                <ComparisonRow label="Wants" current={groupCategorySpend.wants} previous={previousGroupCategorySpend.wants} trend="lower-better" />
                <ComparisonRow label="Savings & Investments" current={groupCategorySpend.savings} previous={previousGroupCategorySpend.savings} trend="higher-better" />
                <ComparisonRow label="Net cash flow" current={netCashFlow} previous={Number(previousMonthData.summary.incomeTotal || 0) - Number(previousMonthData.summary.spendingTotal || 0)} trend="higher-better" />
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="grid gap-3">
        <h3 className="text-2xl font-semibold tracking-tight text-[#071F42]">Top insights this month</h3>
        <div className="grid gap-4 xl:grid-cols-3">
          {latestInsightCards.map((card, index) => (
            <TopInsightCard key={card.id} card={card} tone={index === 0 ? "positive" : index === 1 ? "warning" : "attention"} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#071F42]">
            Category deep dive <Info size={15} className="text-text-muted" />
          </h3>
          <p className="text-sm text-text-muted">Explore how specific categories are trending.</p>
          {spendingBreakdownRows[0] ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_1.2fr]">
              <div>
                <div className="max-w-[210px]">
                  <button
                    type="button"
                    className="w-full rounded-xl border border-app-border bg-app-background px-3 py-2 text-left text-sm text-text-main"
                  >
                    {spendingBreakdownRows[0]?.label || "Category"} ?
                  </button>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
                  <MetricPill label="This month" value={formatCurrency(spendingBreakdownRows[0]?.value || 0)} />
                  <MetricPill label={`vs ${formatMonthLabel(previousMonthKey)}`} value={formatCurrency(previousCategoryMap.get(spendingBreakdownRows[0]?.label || "") || 0)} />
                  <MetricPill
                    label="Change"
                    value={`${((spendingBreakdownRows[0]?.value || 0) - (previousCategoryMap.get(spendingBreakdownRows[0]?.label || "") || 0) >= 0 ? "+" : "")}${formatCurrency((spendingBreakdownRows[0]?.value || 0) - (previousCategoryMap.get(spendingBreakdownRows[0]?.label || "") || 0))}`}
                    tone={(spendingBreakdownRows[0]?.value || 0) - (previousCategoryMap.get(spendingBreakdownRows[0]?.label || "") || 0) > 0 ? "danger" : "success"}
                  />
                </div>
              </div>
              <div className="self-center">
                <Sparkline values={chartCurrentRows.map((row) => row.value)} tone="red" />
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-app-border bg-app-background p-4 text-sm text-text-muted">
              No category data available for deep dive yet.
            </div>
          )}
        </Card>

        <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-5">
          <h3 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#071F42]">
            Savings rate <Info size={15} className="text-text-muted" />
          </h3>
          {incomeTotal <= 0 ? (
            <div className="mt-4 flex items-center gap-4 rounded-xl border border-dashed border-app-border bg-app-background p-4">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-app-border bg-white text-text-muted">
                <CircleDollarSign size={20} />
              </span>
              <p className="text-sm text-text-muted">Add income data to calculate savings rate.</p>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-4">
              <SavingsRateRing percent={Math.max(0, Math.round((netCashFlow / incomeTotal) * 100))} />
              <div>
                <p className="text-3xl font-semibold tracking-tight text-[#071F42]">
                  {formatCurrency(Math.max(netCashFlow, 0))}
                </p>
                <p className="text-sm text-text-muted">of {formatCurrency(incomeTotal)} income</p>
                <p className="mt-2 text-sm font-medium text-status-success">
                  {Math.max(0, Math.round((netCashFlow / incomeTotal) * 100))}% savings rate
                </p>
              </div>
            </div>
          )}
        </Card>
      </section>
      <Card className="rounded-2xl border border-app-border bg-white p-4">
        <button
          type="button"
          className="text-sm font-semibold text-brand-primary"
          onClick={() => setShowDetailedReports((current) => !current)}
        >
          {showDetailedReports ? "Hide detailed reports" : "Show detailed reports"}
        </button>
        {showDetailedReports ? (
          <div className="mt-4 grid gap-6">

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <SectionHeader
            title="Actionable Insights"
            description="Rule-based recommendations from this month and YTD trend context."
          />
          <div className="grid gap-3 p-5">
            {actionableCards.map((card) => (
              <ActionableInsightCard key={card.id} card={card} />
            ))}
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Spending Composition"
            description="Category composition with a ranked list for fast pattern recognition."
          />
          <div className="grid gap-5 p-5">
            <div className="mx-auto w-full max-w-xl">
              <DonutChart
                data={categoryRows.map((row) => ({ label: row.label, value: row.value }))}
                valueLabel="Category spend"
                showLegend={false}
                showPercentInTooltip
                emptyMessage="No category spending for this month."
              />
            </div>
            <CategoryCompositionList rows={categoryRows} />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Monthly Spending Trend"
            description="Month-by-month YTD spending totals for quick trend reading."
          />
          {monthlyTrendRows.length === 0 ? (
            <EmptyPanel message="Add transactions to unlock monthly spending trend." />
          ) : (
            <div className="grid gap-4 p-5">
              <LineTrendChart
                data={monthlyTrendRows}
                lineKey="value"
                lineName="Monthly spending"
                xKey="label"
                emptyMessage="No monthly trend data."
              />
              <VerticalBarChart
                data={monthlyTrendRows}
                dataKey="value"
                dataName="Monthly spending"
                xKey="label"
                emptyMessage="No monthly bar data."
              />
            </div>
          )}
        </Card>

        <Card>
          <SectionHeader
            title="Budget vs Actual"
            description="Top categories compared by budget and tracked spending."
          />
          {budgetVsActualRows.length === 0 ? (
            <EmptyPanel message="No budget comparison data for this month." />
          ) : (
            <div className="grid gap-3 p-5">
              <StackedBarChart
                data={budgetVsActualRows}
                xKey="label"
                stackAKey="budget"
                stackAName="Budget"
                stackBKey="spent"
                stackBName="Spent"
                emptyMessage="No budget vs actual chart data."
              />
              <BudgetStatusList rows={budgetVsActualRows} />
            </div>
          )}
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionHeader
            title="Merchant Concentration"
            description="Top merchants with share and transaction-count context."
          />
          <div className="grid gap-4 p-5">
            <HorizontalBarChart
              title="Top merchants"
              description="Merchant spending bars with amount and transaction counts"
              items={merchantRows}
              valueLabel="Net spending"
              emptyMessage="No merchant spending for this month."
            />
            <MerchantConcentrationCard
              topMerchant={merchantRows[0] ?? null}
              spendingTotal={Number(data.summary.spendingTotal || 0)}
            />
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Transaction Type Mix"
            description="Entered amount and net spending impact by transaction type."
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

      <section className="grid gap-6">
        <Card>
          <SectionHeader
            title="Net Worth Trends"
            description="Historical net worth from manual account and debt snapshots."
          />
          <div className="grid gap-5 p-5">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
              <div>
                <p className="text-sm text-text-muted">
                  Net worth trends use manual account and debt snapshots.
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Savings goals are not counted unless represented by account balance snapshots.
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  Credit card balances are not included unless entered as liability snapshots.
                </p>
                <p className="mt-1 text-sm text-text-muted">Missing months are shown as no data.</p>
              </div>
              <Select
                label="Trend range"
                value={netWorthRangeMonths}
                onChange={(event) => setNetWorthRangeMonths(event.target.value)}
              >
                <option value="6">Last 6 months</option>
                <option value="12">Last 12 months</option>
              </Select>
            </div>

            {!hasAnyNetWorthSnapshots ? (
              <EmptyState description="Net worth trends will appear after you add account and debt snapshots." />
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <SimpleMetricCard
                    label="Current Net Worth"
                    value={currentNetWorth}
                    emptyLabel="No data"
                  />
                  <SimpleMetricCard
                    label="Starting Net Worth"
                    value={startingNetWorth}
                    emptyLabel="No data"
                  />
                  <SimpleMetricCard
                    label="Net Worth Change"
                    value={netWorthChange}
                    emptyLabel="Need 2+ months"
                    helperText={
                      netWorthTrendStatus === "up"
                        ? "Improved over range"
                        : netWorthTrendStatus === "down"
                          ? "Declined over range"
                          : netWorthTrendStatus === "flat"
                            ? "No change over range"
                            : "Add more monthly snapshots"
                    }
                  />
                  <Card className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
                      Best / Worst Month
                    </p>
                    <p className="mt-2 text-sm font-semibold text-text-main">
                      {bestMonth
                        ? `${formatMonthLabel(bestMonth.monthKey)} (${formatCurrency(bestMonth.netWorth)})`
                        : "No data"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {worstMonth
                        ? `${formatMonthLabel(worstMonth.monthKey)} (${formatCurrency(worstMonth.netWorth)})`
                        : "No data"}
                    </p>
                  </Card>
                </div>

                {netWorthMonthsWithData.length === 1 ? (
                  <p className="text-sm text-text-muted">
                    Add snapshots for more months to see a trend.
                  </p>
                ) : null}
                {!hasAnyLiabilitySnapshots ? (
                  <p className="text-sm text-text-muted">
                    Liability snapshots are missing, so net worth may be incomplete without debt
                    data.
                  </p>
                ) : null}

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="xl:col-span-2">
                    <h4 className="mb-2 text-sm font-semibold text-text-main">
                      Net Worth by Month
                    </h4>
                    <LineTrendChart
                      data={netWorthTrendRows
                        .filter((row) => row.hasData)
                        .map((row) => ({ id: row.id, label: row.label, value: row.netWorth }))}
                      lineKey="value"
                      lineName="Net worth"
                      xKey="label"
                      emptyMessage="No net worth trend data yet."
                    />
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-text-main">Trend Breakdown</h4>
                    <div className="grid gap-3">
                      <TrendBreakdownRow
                        label="Assets"
                        current={assetTrend.current}
                        start={assetTrend.start}
                        change={assetTrend.change}
                        status={assetTrend.status}
                      />
                      <TrendBreakdownRow
                        label="Liabilities"
                        current={liabilityTrend.current}
                        start={liabilityTrend.start}
                        change={liabilityTrend.change}
                        status={liabilityTrend.status}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </section>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function Sparkline({ values, tone = "green" }) {
  const safeValues = values ?? [];
  const hasPositive = safeValues.some((value) => Number(value || 0) > 0);
  if (!hasPositive) {
    return (
      <div className="mt-3 flex h-14 items-center justify-center rounded-lg border border-dashed border-app-border bg-app-background text-xs text-text-muted">
        Not enough trend history
      </div>
    );
  }

  const points = safeValues.map((value, index) => ({
    x: index,
    y: Number(value || 0),
  }));
  const maxValue = Math.max(...points.map((point) => point.y), 1);
  const minValue = Math.min(...points.map((point) => point.y), 0);
  const range = Math.max(maxValue - minValue, 1);
  const chartPoints = points
    .map((point, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * 100;
      const y = 100 - ((point.y - minValue) / range) * 70 - 15;
      return `${x},${y}`;
    })
    .join(" ");
  const stroke = tone === "red" ? "#EF4444" : tone === "green" ? "#198754" : "#102A63";

  return (
    <svg viewBox="0 0 100 100" className="mt-3 h-14 w-full">
      <line x1="0" y1="82" x2="100" y2="82" stroke="#E8E3D8" />
      <polyline fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" points={chartPoints} />
    </svg>
  );
}

function DualLineMiniChart({ currentRows = [], previousRows = [] }) {
  const hasCurrentData = currentRows.some((row) => Number(row.value || 0) > 0);
  const hasPreviousData = previousRows.some((row) => Number(row.value || 0) > 0);
  if (!hasCurrentData && !hasPreviousData) {
    return (
      <div className="mt-4">
        <div className="h-40 rounded-lg border border-dashed border-app-border bg-app-background" />
        <p className="mt-2 text-xs text-text-muted">No monthly trend data yet.</p>
      </div>
    );
  }

  const meaningfulCurrentPoints = currentRows.filter((row) => Number(row.value || 0) > 0).length;
  if (meaningfulCurrentPoints < 2) {
    return (
      <div className="mt-4">
        <div className="h-40 rounded-lg border border-dashed border-app-border bg-app-background" />
        <p className="mt-2 text-xs text-text-muted">Need at least two months of spending data.</p>
      </div>
    );
  }

  const maxValue = Math.max(
    1,
    ...currentRows.map((row) => Number(row.value || 0)),
    ...previousRows.map((row) => Number(row.value || 0)),
  );
  const scaledMax = maxValue * 1.18;
  const buildPoints = (rows) =>
    rows
      .map((row, index) => {
        const x = (index / Math.max(rows.length - 1, 1)) * 100;
        const y = 100 - (Number(row.value || 0) / scaledMax) * 68 - 16;
        return `${x},${y}`;
      })
      .join(" ");

  const showPrevious = previousRows.some((row) => Number(row.value || 0) > 0);

  return (
    <div className="mt-4">
      <svg viewBox="0 0 100 100" className="h-40 w-full">
        <line x1="0" y1="85" x2="100" y2="85" stroke="#E8E3D8" />
        <line x1="0" y1="62" x2="100" y2="62" stroke="#F0ECE4" />
        <line x1="0" y1="39" x2="100" y2="39" stroke="#F0ECE4" />
        {showPrevious ? (
          <polyline
            fill="none"
            stroke="#98A2B3"
            strokeDasharray="2 2"
            strokeWidth="2"
            points={buildPoints(previousRows)}
          />
        ) : null}
        <polyline fill="none" stroke="#102A63" strokeWidth="2.5" points={buildPoints(currentRows)} />
        {currentRows.map((row, index) => {
          const x = (index / Math.max(currentRows.length - 1, 1)) * 100;
          const y = 100 - (Number(row.value || 0) / scaledMax) * 68 - 16;
          return <circle key={`dot-${row.id}`} cx={x} cy={y} r="1.9" fill="#102A63" />;
        })}
      </svg>
      <div className="mt-2 grid grid-cols-6 gap-2 text-center text-xs text-text-muted">
        {currentRows.map((row) => (
          <span key={`trend-label-${row.id}`} className="truncate">
            {(row.label || formatMonthLabel(row.id).slice(0, 3)).slice(0, 3)}
          </span>
        ))}
      </div>
    </div>
  );
}

function ComparisonRow({ label, previous, current, trend = "lower-better" }) {
  const delta = Number(current || 0) - Number(previous || 0);
  const isPositive = delta > 0;
  const toneClass =
    delta === 0
      ? "text-text-muted"
      : trend === "higher-better"
        ? isPositive
          ? "text-status-success"
          : "text-status-danger"
        : isPositive
          ? "text-status-danger"
          : "text-status-success";
  const deltaLabel = `${delta > 0 ? "+" : ""}${formatCurrency(delta)}`;

  return (
    <tr className="border-t border-app-border">
      <td className="px-2 py-2 text-text-main truncate" title={label}>{label}</td>
      <td className="px-2 py-2 text-right font-medium text-[#071F42] whitespace-nowrap">{formatCurrency(previous || 0)}</td>
      <td className="px-2 py-2 text-right font-medium text-[#071F42] whitespace-nowrap">{formatCurrency(current || 0)}</td>
      <td className={`px-2 py-2 text-right font-semibold whitespace-nowrap ${toneClass}`}>{deltaLabel}</td>
    </tr>
  );
}

function TopInsightCard({ card, tone = "positive" }) {
  const toneMap = {
    positive: {
      cardClass: "border-status-success/30 bg-status-success/5",
      iconClass: "bg-status-success/15 text-status-success",
      icon: CheckCircle2,
      linkClass: "text-status-success",
      actionText: "Open budget",
    },
    warning: {
      cardClass: "border-status-warning/35 bg-status-warning/10",
      iconClass: "bg-status-warning/20 text-status-warning",
      icon: AlertTriangle,
      linkClass: "text-status-warningDark",
      actionText: "Review spending",
    },
    attention: {
      cardClass: "border-status-danger/30 bg-status-danger/5",
      iconClass: "bg-status-danger/15 text-status-danger",
      icon: CircleAlert,
      linkClass: "text-status-danger",
      actionText: "Compare category",
    },
  };
  const style = toneMap[tone] ?? toneMap.positive;
  const Icon = style.icon;

  return (
    <Card className={`rounded-2xl border p-4 ${style.cardClass}`}>
      <div className="flex items-start gap-3">
        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconClass}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-lg font-semibold tracking-tight text-[#071F42]">{card.title}</p>
          <p className="mt-1 text-sm text-text-main">{card.explanation}</p>
          <button
            type="button"
            className={`mt-3 text-sm font-semibold ${style.linkClass}`}
            onClick={() => dispatchNavigation(card.targetView || "insights")}
          >
            {style.actionText} ?
          </button>
        </div>
      </div>
    </Card>
  );
}

function MetricPill({ label, value, tone = "neutral" }) {
  const toneClass =
    tone === "danger" ? "text-status-danger" : tone === "success" ? "text-status-success" : "text-[#071F42]";
  return (
    <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
      <p className="text-xs text-text-muted">{label}</p>
      <p className={`mt-1 text-lg font-semibold tracking-tight ${toneClass}`}>{value}</p>
    </div>
  );
}

function SavingsRateRing({ percent = 0 }) {
  const safePercent = Math.max(0, Math.min(Number(percent || 0), 100));
  return (
    <span
      className="relative inline-flex h-24 w-24 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#1D8E4B ${safePercent * 3.6}deg, #E6E1D8 0deg)`,
      }}
    >
      <span className="absolute h-16 w-16 rounded-full bg-white" />
      <span className="relative text-2xl font-semibold text-[#071F42]">{safePercent}%</span>
    </span>
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

function ActionableInsightCard({ card }) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-background p-4">
      <p className="text-sm font-semibold text-text-main">{card.title}</p>
      <p className="mt-1 text-sm text-text-muted">{card.explanation}</p>
      <p className="mt-2 text-xs font-medium text-text-soft">Recommended: {card.action}</p>
      {card.targetView ? (
        <button
          type="button"
          className="mt-3 rounded-lg border border-app-border bg-app-surface px-3 py-1.5 text-xs font-semibold text-brand-primary hover:border-brand-primary/40 hover:bg-app-background"
          onClick={() => dispatchNavigation(card.targetView)}
        >
          Open {card.targetView}
        </button>
      ) : null}
    </div>
  );
}

function CategoryCompositionList({ rows }) {
  if (!rows.length) {
    return <p className="text-sm text-text-muted">No category ranking yet.</p>;
  }

  const visibleLimit = 10;
  const rowsForDisplay = rows.slice(0, visibleLimit);
  const hiddenCount = Math.max(0, rows.length - rowsForDisplay.length);
  const total = rows.reduce((sum, row) => sum + Number(row.value || 0), 0);
  const needsScroll = rows.length > 10;
  const [leftColumnRows, rightColumnRows] = splitCompositionRowsIntoColumns(rowsForDisplay, 2);

  return (
    <div className="grid min-h-0 gap-2">
      <p className="text-sm font-semibold text-text-main">Category ranking</p>
      <div className={`${needsScroll ? "max-h-96 overflow-y-auto pr-1" : ""}`}>
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-2">
            {leftColumnRows.map((row, index) => {
              const percent = calculateSharePercent(row.value, total);
              return (
                <CompositionRankRow
                  key={row.id}
                  rank={index + 1}
                  label={row.label}
                  formattedValue={row.formattedValue}
                  percent={percent}
                />
              );
            })}
          </div>
          <div className="grid gap-2">
            {rightColumnRows.map((row, index) => {
              const percent = calculateSharePercent(row.value, total);
              return (
                <CompositionRankRow
                  key={row.id}
                  rank={leftColumnRows.length + index + 1}
                  label={row.label}
                  formattedValue={row.formattedValue}
                  percent={percent}
                />
              );
            })}
          </div>
        </div>
      </div>
      {hiddenCount > 0 ? (
        <p className="text-xs text-text-muted">
          Showing top {rowsForDisplay.length} categories. {hiddenCount} more categories are
          available.
        </p>
      ) : null}
    </div>
  );
}

function CompositionRankRow({ rank, label, formattedValue, percent }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 rounded-xl border border-app-border bg-app-background px-3 py-2.5">
      <p className="min-w-0 truncate text-sm font-medium text-text-main" title={label}>
        {rank}. {label}
      </p>
      <div className="text-right">
        <p className="text-sm font-semibold text-text-main">{formattedValue}</p>
        <p className="text-xs text-text-muted">{percent.toFixed(1)}%</p>
      </div>
    </div>
  );
}

function MerchantConcentrationCard({ topMerchant, spendingTotal }) {
  if (!topMerchant || spendingTotal <= 0) {
    return (
      <p className="text-sm text-text-muted">
        Merchant concentration appears after you have spending data.
      </p>
    );
  }

  const share = calculateSharePercent(topMerchant.value, spendingTotal);
  const isHigh = share >= 30;

  return (
    <div className="rounded-2xl border border-app-border bg-app-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        Top merchant concentration
      </p>
      <p className="mt-1 text-sm font-semibold text-text-main">
        {topMerchant.label}: {share.toFixed(0)}% of monthly spending
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {topMerchant.helperText} | {topMerchant.formattedValue}
      </p>
      <p
        className={`mt-2 text-xs font-semibold ${isHigh ? "text-status-warningDark" : "text-text-muted"}`}
      >
        {isHigh
          ? "Concentration warning: one merchant is a large share of spending."
          : "Concentration is currently moderate."}
      </p>
    </div>
  );
}

function BudgetStatusList({ rows }) {
  if (!rows.length) return null;

  return (
    <div className="grid gap-2">
      {rows.map((row) => {
        const copy = BUDGET_STATUS_COPY[row.status] ?? BUDGET_STATUS_COPY.safe;
        return (
          <div
            key={row.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-background px-3 py-2"
          >
            <p className="text-sm font-medium text-text-main">{row.label}</p>
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${copy.badge}`}>
              {copy.label}
            </span>
          </div>
        );
      })}
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

function SimpleMetricCard({ label, value, emptyLabel = "No data", helperText = "" }) {
  const hasValue = Number.isFinite(Number(value));
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold text-text-main">
        {hasValue ? formatCurrency(Number(value)) : emptyLabel}
      </p>
      {helperText ? <p className="mt-1 text-xs text-text-muted">{helperText}</p> : null}
    </Card>
  );
}

function TrendBreakdownRow({ label, current, start, change, status }) {
  const hasData = Number.isFinite(Number(current)) && Number.isFinite(Number(start));
  return (
    <Card className="p-4">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text-muted">
        Current: {hasData ? formatCurrency(Number(current)) : "No data"}
      </p>
      <p className="mt-1 text-sm text-text-muted">
        Start: {hasData ? formatCurrency(Number(start)) : "No data"}
      </p>
      <p className="mt-1 text-sm font-semibold text-text-main">
        Change:{" "}
        {Number.isFinite(Number(change)) ? formatCurrency(Number(change)) : "Need 2+ months"}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        {status === "up"
          ? "Trend up"
          : status === "down"
            ? "Trend down"
            : status === "flat"
              ? "No change"
              : "Insufficient data"}
      </p>
    </Card>
  );
}


