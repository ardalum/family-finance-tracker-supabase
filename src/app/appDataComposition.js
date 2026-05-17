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
  };
}

export function createDashboardAppData(input = {}) {
  return createFeatureAppData(input);
}

export function createInsightsAppData(input = {}) {
  return createFeatureAppData(input);
}
