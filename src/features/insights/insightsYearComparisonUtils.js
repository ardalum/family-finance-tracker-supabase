import { formatCurrency, formatMonthLabel } from "../../lib/formatters.js";
import {
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  UNCATEGORIZED_ID,
  UNCATEGORIZED_NAME,
} from "../spending/spendingService.js";
import { formatMonthKeyRange } from "./insightsYtdUtils.js";

function getSamePeriodPreviousYearRange(selectedMonth) {
  if (!selectedMonth) return [];
  const [year, month] = selectedMonth.split("-").map(Number);
  return Array.from({ length: month }, (_, index) => {
    const monthNumber = index + 1;
    return `${year - 1}-${String(monthNumber).padStart(2, "0")}`;
  });
}

function getMonthSpending(transactions = []) {
  return transactions.reduce(
    (sum, transaction) => sum + getTransactionImpactAmount(transaction),
    0,
  );
}

function getCategoryLookup(budgetsByMonth, monthKeys) {
  return monthKeys.flatMap((monthKey) => budgetsByMonth[monthKey] ?? []);
}

function getCategoryTotalsForMonths(monthKeys, transactionsByMonth, categoryLookup) {
  const totals = new Map();

  monthKeys.forEach((monthKey) => {
    (transactionsByMonth[monthKey] ?? []).forEach((transaction) => {
      const impact = getTransactionImpactAmount(transaction);
      if (impact === 0) return;
      const direction = impact < 0 ? -1 : 1;

      getTransactionCategoryRows(transaction).forEach((row) => {
        const name =
          row.categoryId === UNCATEGORIZED_ID
            ? UNCATEGORIZED_NAME
            : getCategoryName(row.categoryId, categoryLookup);
        totals.set(name, (totals.get(name) ?? 0) + Number(row.amount || 0) * direction);
      });
    });
  });

  return Array.from(totals.entries())
    .map(([label, value]) => ({
      id: label,
      label,
      value,
      formattedValue: formatCurrency(value),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}

function getMerchantTotalsForMonths(monthKeys, transactionsByMonth) {
  const totals = new Map();

  monthKeys.forEach((monthKey) => {
    (transactionsByMonth[monthKey] ?? []).forEach((transaction) => {
      const impact = getTransactionImpactAmount(transaction);
      if (impact === 0) return;

      const name = transaction.merchant || "Unknown merchant";
      const current = totals.get(name) ?? { value: 0, count: 0 };
      totals.set(name, {
        value: current.value + impact,
        count: current.count + 1,
      });
    });
  });

  return Array.from(totals.entries())
    .map(([label, info]) => ({
      id: label,
      label,
      value: info.value,
      formattedValue: formatCurrency(info.value),
      helperText: `${info.count} transaction${info.count === 1 ? "" : "s"}`,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}

function buildDeltaRows(currentRows, previousRows, limit = 8) {
  const previousMap = new Map(previousRows.map((row) => [row.label, row]));
  const currentMap = new Map(currentRows.map((row) => [row.label, row]));
  const labels = new Set([...previousMap.keys(), ...currentMap.keys()]);

  return Array.from(labels)
    .map((label) => {
      const current = currentMap.get(label)?.value ?? 0;
      const previous = previousMap.get(label)?.value ?? 0;
      const delta = current - previous;
      return {
        id: label,
        label,
        current,
        previous,
        delta,
        formattedCurrent: formatCurrency(current),
        formattedPrevious: formatCurrency(previous),
        formattedDelta: `${delta >= 0 ? "+" : ""}${formatCurrency(delta)}`,
      };
    })
    .filter((row) => row.current > 0 || row.previous > 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, limit);
}

export function getYearOverYearInsightsData({
  selectedMonth,
  transactionsByMonth = {},
  budgetsByMonth = {},
}) {
  const currentMonths = formatMonthKeyRange(selectedMonth);
  const previousMonths = getSamePeriodPreviousYearRange(selectedMonth);

  const [selectedYear, selectedMonthNumber] = selectedMonth.split("-").map(Number);
  const previousSelectedMonth = `${selectedYear - 1}-${String(selectedMonthNumber).padStart(2, "0")}`;

  const categoryLookup = getCategoryLookup(budgetsByMonth, [...currentMonths, ...previousMonths]);

  const currentMonthSpending = getMonthSpending(transactionsByMonth[selectedMonth] ?? []);
  const previousMonthSpending = getMonthSpending(transactionsByMonth[previousSelectedMonth] ?? []);

  const currentYtdSpending = currentMonths.reduce(
    (sum, monthKey) => sum + getMonthSpending(transactionsByMonth[monthKey] ?? []),
    0,
  );
  const previousYtdSpending = previousMonths.reduce(
    (sum, monthKey) => sum + getMonthSpending(transactionsByMonth[monthKey] ?? []),
    0,
  );

  const currentAverage = currentMonths.length > 0 ? currentYtdSpending / currentMonths.length : 0;
  const previousAverage =
    previousMonths.length > 0 ? previousYtdSpending / previousMonths.length : 0;

  const currentCategoryTotals = getCategoryTotalsForMonths(
    currentMonths,
    transactionsByMonth,
    categoryLookup,
  );
  const previousCategoryTotals = getCategoryTotalsForMonths(
    previousMonths,
    transactionsByMonth,
    categoryLookup,
  );
  const currentMerchantTotals = getMerchantTotalsForMonths(currentMonths, transactionsByMonth);
  const previousMerchantTotals = getMerchantTotalsForMonths(previousMonths, transactionsByMonth);

  const previousMonthsWithData = previousMonths.filter(
    (monthKey) => (transactionsByMonth[monthKey] ?? []).length > 0,
  ).length;

  const hasPreviousYearData = previousMonthsWithData > 0;
  const isPartialPreviousYear =
    hasPreviousYearData && previousMonthsWithData < previousMonths.length;

  return {
    hasPreviousYearData,
    isPartialPreviousYear,
    previousMonthsWithData,
    previousMonthsExpected: previousMonths.length,
    currentMonths,
    previousMonths,
    selectedMonthComparison: {
      currentMonthKey: selectedMonth,
      previousMonthKey: previousSelectedMonth,
      current: currentMonthSpending,
      previous: previousMonthSpending,
      delta: currentMonthSpending - previousMonthSpending,
      formattedCurrent: formatCurrency(currentMonthSpending),
      formattedPrevious: formatCurrency(previousMonthSpending),
      labelCurrent: formatMonthLabel(selectedMonth),
      labelPrevious: formatMonthLabel(previousSelectedMonth),
    },
    ytdComparison: {
      current: currentYtdSpending,
      previous: previousYtdSpending,
      delta: currentYtdSpending - previousYtdSpending,
      formattedCurrent: formatCurrency(currentYtdSpending),
      formattedPrevious: formatCurrency(previousYtdSpending),
    },
    averageComparison: {
      current: currentAverage,
      previous: previousAverage,
      delta: currentAverage - previousAverage,
      formattedCurrent: formatCurrency(currentAverage),
      formattedPrevious: formatCurrency(previousAverage),
    },
    topCategoryComparison: {
      current: currentCategoryTotals[0] ?? null,
      previous: previousCategoryTotals[0] ?? null,
    },
    topMerchantComparison: {
      current: currentMerchantTotals[0] ?? null,
      previous: previousMerchantTotals[0] ?? null,
    },
    categoryDeltas: buildDeltaRows(currentCategoryTotals, previousCategoryTotals),
    merchantDeltas: buildDeltaRows(currentMerchantTotals, previousMerchantTotals),
  };
}
