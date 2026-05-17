import { getMonthTransactions, getTotalSpending } from "../spending/spendingService.js";
import { getRecurringSummary } from "../recurring/recurringService.js";
import { summarizeIncomeForMonth } from "../income/incomeService.js";
import { summarizeSavingsForMonth } from "../savings/savingsService.js";
import { summarizeLiquidCashForMonth } from "../accounts/accountsService.js";
import { calculateLiabilityBalanceTotal } from "../liabilities/liabilitiesService.js";
import { summarizeNetWorthForMonth } from "../netWorth/netWorthService.js";
import { getDashboardCashFlow } from "../dashboard/dashboardCashFlow.js";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

export function summarizeFinancialPositionForMonth({
  selectedMonth,
  transactions = [],
  recurringPayments = [],
  recurringStatusByMonth = {},
  incomeEntries = [],
  savingsContributions = [],
  cashAccounts = [],
  accountBalanceSnapshots = [],
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
} = {}) {
  const safeTransactions = toArray(transactions);
  const safeRecurringPayments = toArray(recurringPayments);
  const safeIncomeEntries = toArray(incomeEntries);
  const safeSavingsContributions = toArray(savingsContributions);
  const safeCashAccounts = toArray(cashAccounts);
  const safeAccountSnapshots = toArray(accountBalanceSnapshots);
  const safeLiabilityAccounts = toArray(liabilityAccounts);
  const safeLiabilitySnapshots = toArray(liabilityBalanceSnapshots);

  const monthTransactions = getMonthTransactions(safeTransactions, selectedMonth);
  const spendingTotal = getTotalSpending(monthTransactions);
  const recurringSummary = getRecurringSummary(
    safeRecurringPayments,
    selectedMonth,
    recurringStatusByMonth,
  );
  const recurringRemaining = recurringSummary.remainingTotal;

  const incomeTotal = summarizeIncomeForMonth(safeIncomeEntries, selectedMonth);
  const savingsTotal = summarizeSavingsForMonth(safeSavingsContributions, selectedMonth);
  const liquidCashTotal = summarizeLiquidCashForMonth(
    safeCashAccounts,
    safeAccountSnapshots,
    selectedMonth,
  );
  const totalDebt = calculateLiabilityBalanceTotal(
    safeLiabilityAccounts,
    safeLiabilitySnapshots,
    selectedMonth,
  );
  const netWorthSummary = summarizeNetWorthForMonth({
    cashAccounts: safeCashAccounts,
    accountBalanceSnapshots: safeAccountSnapshots,
    liabilityAccounts: safeLiabilityAccounts,
    liabilityBalanceSnapshots: safeLiabilitySnapshots,
    monthKey: selectedMonth,
  });
  const cashFlowSummary = getDashboardCashFlow({
    selectedMonth,
    incomeEntries: safeIncomeEntries,
    savingsContributions: safeSavingsContributions,
    spendingTotal,
    recurringRemaining,
  });

  const hasIncomeForMonth = safeIncomeEntries.some((entry) => entry.monthKey === selectedMonth);
  const hasSavingsForMonth = safeSavingsContributions.some(
    (entry) => entry.monthKey === selectedMonth,
  );
  const hasAccountSnapshotsForMonth = safeAccountSnapshots.some(
    (snapshot) => snapshot.monthKey === selectedMonth,
  );
  const hasLiabilitySnapshotsForMonth = safeLiabilitySnapshots.some(
    (snapshot) => snapshot.monthKey === selectedMonth,
  );
  const hasNetWorthSnapshotData = hasAccountSnapshotsForMonth || hasLiabilitySnapshotsForMonth;

  return {
    incomeTotal,
    savingsTotal,
    liquidCashTotal,
    totalDebt,
    netWorthSummary,
    cashFlowSummary,
    needsUpdate: {
      income: !hasIncomeForMonth,
      savings: !hasSavingsForMonth,
      accounts: !hasAccountSnapshotsForMonth,
      liabilities: !hasLiabilitySnapshotsForMonth,
      netWorth: !hasNetWorthSnapshotData,
    },
  };
}
