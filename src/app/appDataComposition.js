export function createFeatureAppData({
  appData,
  creditCards,
  monthlyBalances,
  selectedMonth,
  budgets,
  transactions,
  ytdBudgetsByMonth,
  ytdTransactionsByMonth,
  recurringPayments,
  recurringStatusByMonth,
  incomeEntries,
  savingsContributions,
  cashAccounts,
  accountBalanceSnapshots,
  liabilityAccounts,
  liabilityBalanceSnapshots,
} = {}) {
  return {
    ...appData,
    creditCards,
    monthlyBalances,
    budgetsByMonth: {
      ...appData?.budgetsByMonth,
      [selectedMonth]: budgets,
    },
    transactions,
    ytdBudgetsByMonth,
    ytdTransactionsByMonth,
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions: transactions,
    incomeEntries,
    savingsContributions,
    cashAccounts,
    accountBalanceSnapshots,
    liabilityAccounts,
    liabilityBalanceSnapshots,
  };
}

export function createDashboardAppData(input = {}) {
  return createFeatureAppData(input);
}

export function createInsightsAppData(input = {}) {
  return createFeatureAppData(input);
}
