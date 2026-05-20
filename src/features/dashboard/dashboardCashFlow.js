import { summarizeIncomeForMonth } from "../income/incomeService.js";
import { summarizeSavingsForMonth } from "../savings/savingsService.js";
import { summarizeLiquidCashForMonth } from "../accounts/accountsService.js";
import { calculateProjectedMovementTotal } from "../accounts/accountMoneyMovementsService.js";

export function getDashboardCashFlow({
  selectedMonth,
  incomeEntries = [],
  savingsContributions = [],
  cashAccounts = [],
  accountBalanceSnapshots = [],
  accountMoneyMovements = [],
  budgetTotal = 0,
  remainingBudget = 0,
  spendingTotal = 0,
  recurringRemaining = 0,
  unpaidCardBalanceTotal = 0,
} = {}) {
  const safeIncomeEntries = Array.isArray(incomeEntries) ? incomeEntries : [];
  const safeSavingsContributions = Array.isArray(savingsContributions) ? savingsContributions : [];
  const safeCashAccounts = Array.isArray(cashAccounts) ? cashAccounts : [];
  const safeAccountBalanceSnapshots = Array.isArray(accountBalanceSnapshots)
    ? accountBalanceSnapshots
    : [];
  const safeAccountMoneyMovements = Array.isArray(accountMoneyMovements)
    ? accountMoneyMovements
    : [];
  const incomeTotal = summarizeIncomeForMonth(safeIncomeEntries, selectedMonth);
  const savingsContributionTotal = summarizeSavingsForMonth(
    safeSavingsContributions,
    selectedMonth,
  );
  const liquidAccountTypes = new Set([
    "checking",
    "savings",
    "cash",
    "money_market",
    "emergency_fund",
    "other",
  ]);
  const liquidAccountIds = new Set(
    safeCashAccounts
      .filter((account) => liquidAccountTypes.has(account?.accountType))
      .map((account) => account?.supabaseId ?? account?.id)
      .filter(Boolean),
  );
  const snapshotCashPositionTotal = summarizeLiquidCashForMonth(
    safeCashAccounts,
    safeAccountBalanceSnapshots,
    selectedMonth,
  );
  const trackedMovementTotal = calculateProjectedMovementTotal(
    safeAccountMoneyMovements.filter((movement) => liquidAccountIds.has(movement?.accountId)),
    { monthKey: selectedMonth },
  );
  const cashPositionTotal = snapshotCashPositionTotal + trackedMovementTotal;
  const normalizedBudgetTotal = Number(budgetTotal) || 0;
  const normalizedRemainingBudget = Number(remainingBudget) || 0;
  const normalizedSpendingTotal = Number(spendingTotal) || 0;
  const normalizedRecurringRemaining = Number(recurringRemaining) || 0;
  const normalizedUnpaidCardBalanceTotal = Number(unpaidCardBalanceTotal) || 0;
  const estimatedLeftover =
    incomeTotal - normalizedSpendingTotal - normalizedRecurringRemaining - savingsContributionTotal;
  const upcomingObligationsTotal = normalizedRecurringRemaining + normalizedUnpaidCardBalanceTotal;
  const plannedCashCushion =
    incomeTotal -
    normalizedRecurringRemaining -
    normalizedUnpaidCardBalanceTotal -
    savingsContributionTotal;
  const hasCashSnapshotData = safeAccountBalanceSnapshots.some(
    (snapshot) => snapshot?.monthKey === selectedMonth,
  );
  const hasBudgetData = normalizedBudgetTotal > 0;

  const hasIncomeData = safeIncomeEntries.some((entry) => entry.monthKey === selectedMonth);
  const hasSavingsData = safeSavingsContributions.some((entry) => entry.monthKey === selectedMonth);
  const hasRecurringRemaining = normalizedRecurringRemaining > 0;
  const hasUnpaidCardObligations = normalizedUnpaidCardBalanceTotal > 0;
  const hasUpcomingObligations = upcomingObligationsTotal > 0;
  const status = !hasIncomeData
    ? "missing-income"
    : estimatedLeftover < 0
      ? "negative"
      : "positive";

  return {
    incomeTotal,
    cashPositionTotal,
    hasCashSnapshotData,
    budgetTotal: normalizedBudgetTotal,
    remainingBudget: normalizedRemainingBudget,
    hasBudgetData,
    spendingTotal: normalizedSpendingTotal,
    savingsContributionTotal,
    recurringRemaining: normalizedRecurringRemaining,
    unpaidCardBalanceTotal: normalizedUnpaidCardBalanceTotal,
    upcomingObligationsTotal,
    estimatedLeftover,
    plannedCashCushion,
    hasIncomeData,
    hasSavingsData,
    hasRecurringRemaining,
    hasUnpaidCardObligations,
    hasUpcomingObligations,
    status,
  };
}
