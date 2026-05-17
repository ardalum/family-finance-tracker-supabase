import { formatMonthLabel, formatCurrency } from "../../lib/formatters.js";
import {
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  UNCATEGORIZED_ID,
  UNCATEGORIZED_NAME,
} from "../spending/spendingService.js";

export function formatMonthKeyRange(selectedMonth) {
  if (!selectedMonth) return [];
  const [year, month] = selectedMonth.split("-").map(Number);

  return Array.from({ length: month }, (_, index) => {
    const monthNumber = index + 1;
    return `${year}-${String(monthNumber).padStart(2, "0")}`;
  });
}

export function getYtdInsightsData({
  selectedMonth,
  transactionsByMonth = {},
  budgetsByMonth = {},
  monthlyCloseReviewsByMonth = null,
}) {
  const monthKeys = formatMonthKeyRange(selectedMonth);
  const categoryLookup = buildCategoryLookup(budgetsByMonth, monthKeys);
  const monthlyRows = monthKeys.map((monthKey) => {
    const transactions = transactionsByMonth[monthKey] ?? [];
    const budgets = budgetsByMonth[monthKey] ?? [];
    const spending = transactions.reduce(
      (total, transaction) => total + getTransactionImpactAmount(transaction),
      0,
    );

    return {
      monthKey,
      label: formatMonthLabel(monthKey),
      value: spending,
      formattedValue: formatCurrency(spending),
      transactions,
      budgets,
      overBudgetCount: getMonthOverBudgetCount(budgets, transactions),
      isReviewed: Boolean(monthlyCloseReviewsByMonth?.[monthKey]?.status === "reviewed"),
    };
  });

  const ytdSpendingTotal = monthlyRows.reduce((sum, row) => sum + row.value, 0);
  const monthCount = monthKeys.length;
  const averageMonthlySpending = monthCount > 0 ? ytdSpendingTotal / monthCount : 0;

  const highestSpendingMonth =
    monthlyRows.filter((row) => row.value > 0).sort((a, b) => b.value - a.value)[0] ?? null;

  const categoryTotals = getYtdCategoryTotals(monthlyRows, categoryLookup);
  const merchantTotals = getYtdMerchantTotals(monthlyRows);
  const reviewedMonthCount = monthlyRows.filter((row) => row.isReviewed).length;
  const overBudgetCategoryCountYtd = monthlyRows.reduce((sum, row) => sum + row.overBudgetCount, 0);

  return {
    hasData: monthlyRows.some((row) => row.transactions.length > 0),
    isPartialYear: monthKeys.length < 12,
    monthKeys,
    monthlyRows,
    ytdSpendingTotal,
    averageMonthlySpending,
    highestSpendingMonth,
    topCategoryYtd: categoryTotals[0] ?? null,
    topMerchantYtd: merchantTotals[0] ?? null,
    ytdSpendingByMonth: monthlyRows,
    ytdSpendingByCategory: categoryTotals,
    ytdTopMerchants: merchantTotals,
    overBudgetCategoryCountYtd,
    reviewedMonthCount,
  };
}

function getMonthOverBudgetCount(budgets, transactions) {
  if (!budgets.length) return 0;

  return budgets.filter((budget) => {
    const spent = transactions.reduce((sum, transaction) => {
      return (
        sum +
        getTransactionCategoryRows(transaction)
          .filter((row) => row.categoryId === budget.id)
          .reduce((rowSum, row) => rowSum + Number(row.amount || 0), 0)
      );
    }, 0);

    return spent > Number(budget.monthlyAmount || 0);
  }).length;
}

function buildCategoryLookup(budgetsByMonth, monthKeys) {
  const merged = monthKeys.flatMap((monthKey) => budgetsByMonth[monthKey] ?? []);
  return merged;
}

function getYtdCategoryTotals(monthlyRows, categories) {
  const totals = new Map();

  monthlyRows.forEach((monthRow) => {
    monthRow.transactions.forEach((transaction) => {
      const impact = getTransactionImpactAmount(transaction);
      if (impact === 0) return;
      const direction = impact < 0 ? -1 : 1;

      getTransactionCategoryRows(transaction).forEach((row) => {
        const name =
          row.categoryId === UNCATEGORIZED_ID
            ? UNCATEGORIZED_NAME
            : getCategoryName(row.categoryId, categories);
        totals.set(name, (totals.get(name) ?? 0) + Number(row.amount || 0) * direction);
      });
    });
  });

  return Array.from(totals.entries())
    .map(([name, value]) => ({
      id: name,
      label: name,
      value,
      formattedValue: formatCurrency(value),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}

function getYtdMerchantTotals(monthlyRows) {
  const totals = new Map();

  monthlyRows.forEach((monthRow) => {
    monthRow.transactions.forEach((transaction) => {
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
    .map(([name, info]) => ({
      id: name,
      label: name,
      value: info.value,
      formattedValue: formatCurrency(info.value),
      helperText: `${info.count} transaction${info.count === 1 ? "" : "s"}`,
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value);
}
