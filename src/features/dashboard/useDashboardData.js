import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";
import { listAccountMoneyMovements } from "../accounts/accountMoneyMovementsSupabaseService.js";

export function useDashboardData({ activeHouseholdId, initialSelectedMonth, supabaseCreditCards }) {
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(initialSelectedMonth);
  const [dashboardBudgets, setDashboardBudgets] = useState([]);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [dashboardAccountMoneyMovements, setDashboardAccountMoneyMovements] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboardData = useCallback(async () => {
    if (!activeHouseholdId) {
      setDashboardBudgets([]);
      setDashboardTransactions([]);
      setDashboardAccountMoneyMovements([]);
      setDashboardLoading(false);
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedDashboardMonth);
      const [transactions, accountMoneyMovements] = await Promise.all([
        listTransactions(activeHouseholdId, selectedDashboardMonth, supabaseCreditCards, budgets),
        listAccountMoneyMovements(activeHouseholdId, { monthKey: selectedDashboardMonth }),
      ]);

      setDashboardBudgets(budgets);
      setDashboardTransactions(transactions);
      setDashboardAccountMoneyMovements(accountMoneyMovements);
    } catch (error) {
      setDashboardError(error.message || "Could not load dashboard data.");
      setDashboardBudgets([]);
      setDashboardTransactions([]);
      setDashboardAccountMoneyMovements([]);
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
    dashboardAccountMoneyMovements,
    dashboardLoading,
    dashboardError,
    loadDashboardData,
  };
}
