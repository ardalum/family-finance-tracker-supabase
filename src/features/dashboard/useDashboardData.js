import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";

export function useDashboardData({ activeHouseholdId, initialSelectedMonth, supabaseCreditCards }) {
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(initialSelectedMonth);
  const [dashboardBudgets, setDashboardBudgets] = useState([]);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!activeHouseholdId) {
      setDashboardBudgets([]);
      setDashboardTransactions([]);
      setDashboardLoading(false);
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedDashboardMonth);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedDashboardMonth,
        supabaseCreditCards,
        budgets,
      );

      setDashboardBudgets(budgets);
      setDashboardTransactions(transactions);
    } catch (error) {
      setDashboardError(error.message || "Could not load dashboard data.");
      setDashboardBudgets([]);
      setDashboardTransactions([]);
    } finally {
      setDashboardLoading(false);
    }
  }, [activeHouseholdId, selectedDashboardMonth, supabaseCreditCards]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    selectedDashboardMonth,
    setSelectedDashboardMonth,
    dashboardBudgets,
    dashboardTransactions,
    dashboardLoading,
    dashboardError,
    loadDashboardData,
  };
}
