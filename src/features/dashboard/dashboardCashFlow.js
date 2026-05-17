import { summarizeIncomeForMonth } from "../income/incomeService.js";
import { summarizeSavingsForMonth } from "../savings/savingsService.js";

export function getDashboardCashFlow({
  selectedMonth,
  incomeEntries = [],
  savingsContributions = [],
  spendingTotal = 0,
  recurringRemaining = 0,
} = {}) {
  const safeIncomeEntries = Array.isArray(incomeEntries) ? incomeEntries : [];
  const safeSavingsContributions = Array.isArray(savingsContributions) ? savingsContributions : [];
  const incomeTotal = summarizeIncomeForMonth(safeIncomeEntries, selectedMonth);
  const savingsContributionTotal = summarizeSavingsForMonth(
    safeSavingsContributions,
    selectedMonth,
  );
  const normalizedSpendingTotal = Number(spendingTotal) || 0;
  const normalizedRecurringRemaining = Number(recurringRemaining) || 0;

  const estimatedLeftover =
    incomeTotal - normalizedSpendingTotal - normalizedRecurringRemaining - savingsContributionTotal;

  const hasIncomeData = safeIncomeEntries.some((entry) => entry.monthKey === selectedMonth);
  const hasSavingsData = safeSavingsContributions.some((entry) => entry.monthKey === selectedMonth);
  const hasRecurringRemaining = normalizedRecurringRemaining > 0;
  const status = !hasIncomeData
    ? "missing-income"
    : estimatedLeftover < 0
      ? "negative"
      : "positive";

  return {
    incomeTotal,
    spendingTotal: normalizedSpendingTotal,
    savingsContributionTotal,
    recurringRemaining: normalizedRecurringRemaining,
    estimatedLeftover,
    hasIncomeData,
    hasSavingsData,
    hasRecurringRemaining,
    status,
  };
}
