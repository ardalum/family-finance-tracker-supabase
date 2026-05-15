export async function runRefreshSequence(refreshCallbacks = []) {
  for (const refreshCallback of refreshCallbacks) {
    await refreshCallback();
  }
}

export function createDashboardInsightsRefreshers({ loadDashboardData, loadInsightsData } = {}) {
  return [loadDashboardData, loadInsightsData].filter(Boolean);
}

export function createSpendingDashboardInsightsRefreshers({
  loadSpendingTransactions,
  loadDashboardData,
  loadInsightsData,
} = {}) {
  return [loadSpendingTransactions, loadDashboardData, loadInsightsData].filter(Boolean);
}

export function createRecurringDashboardInsightsRefreshers({
  loadRecurringData,
  loadDashboardData,
  loadInsightsData,
} = {}) {
  return [loadRecurringData, loadDashboardData, loadInsightsData].filter(Boolean);
}

export function createRecurringSpendingDashboardInsightsRefreshers({
  loadRecurringData,
  loadSpendingTransactions,
  loadDashboardData,
  loadInsightsData,
} = {}) {
  return [loadRecurringData, loadSpendingTransactions, loadDashboardData, loadInsightsData].filter(
    Boolean,
  );
}

export function createAllSupabaseRefreshers({
  loadSupabaseCreditCards,
  loadSupabaseMonthlyBalances,
  loadSupabaseBudgets,
  loadSpendingCategories,
  loadSpendingTransactions,
  loadDashboardData,
  loadInsightsData,
  loadRecurringCategories,
  loadRecurringData,
} = {}) {
  return [
    loadSupabaseCreditCards,
    loadSupabaseMonthlyBalances,
    loadSupabaseBudgets,
    loadSpendingCategories,
    loadSpendingTransactions,
    loadDashboardData,
    loadInsightsData,
    loadRecurringCategories,
    loadRecurringData,
  ].filter(Boolean);
}
