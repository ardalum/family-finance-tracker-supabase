import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";

export function useInsightsData({ activeHouseholdId, initialSelectedMonth, supabaseCreditCards }) {
  const [selectedInsightsMonth, setSelectedInsightsMonth] = useState(initialSelectedMonth);
  const [insightsBudgets, setInsightsBudgets] = useState([]);
  const [insightsTransactions, setInsightsTransactions] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");

  const loadInsightsData = useCallback(async () => {
    if (!activeHouseholdId) {
      setInsightsBudgets([]);
      setInsightsTransactions([]);
      setInsightsLoading(false);
      return;
    }

    setInsightsLoading(true);
    setInsightsError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedInsightsMonth);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedInsightsMonth,
        supabaseCreditCards,
        budgets,
      );

      setInsightsBudgets(budgets);
      setInsightsTransactions(transactions);
    } catch (error) {
      setInsightsError(error.message || "Could not load insights data.");
      setInsightsBudgets([]);
      setInsightsTransactions([]);
    } finally {
      setInsightsLoading(false);
    }
  }, [activeHouseholdId, selectedInsightsMonth, supabaseCreditCards]);

  useEffect(() => {
    loadInsightsData();
  }, [loadInsightsData]);

  return {
    selectedInsightsMonth,
    setSelectedInsightsMonth,
    insightsBudgets,
    insightsTransactions,
    insightsLoading,
    insightsError,
    loadInsightsData,
  };
}
