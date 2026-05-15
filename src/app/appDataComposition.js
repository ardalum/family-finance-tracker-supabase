export function createDashboardAppData({
  appData,
  creditCards,
  monthlyBalances,
  selectedMonth,
  budgets,
  transactions,
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
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions: transactions,
  };
}

export function createInsightsAppData({
  appData,
  creditCards,
  monthlyBalances,
  selectedMonth,
  budgets,
  transactions,
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
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions: transactions,
  };
}
