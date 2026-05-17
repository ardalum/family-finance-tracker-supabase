import { summarizeIncomeForMonth } from "../income/incomeService.js";
import { summarizeSavingsForMonth } from "../savings/savingsService.js";

export function getDashboardCashFlow({
  selectedMonth,
  incomeEntries = [],
  savingsContributions = [],
  spendingTotal = 0,
  recurringRemaining = 0,
} = {}) {
  const incomeTotal = summarizeIncomeForMonth(incomeEntries, selectedMonth);
  const savingsContributionTotal = summarizeSavingsForMonth(savingsContributions, selectedMonth);
  const normalizedSpendingTotal = Number(spendingTotal) || 0;
  const normalizedRecurringRemaining = Number(recurringRemaining) || 0;

  const estimatedLeftover =
    incomeTotal - normalizedSpendingTotal - normalizedRecurringRemaining - savingsContributionTotal;

  const hasIncomeData = incomeEntries.some((entry) => entry.monthKey === selectedMonth);
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
    status,
  };
}
