import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";
import { formatMonthKeyRange } from "./insightsYtdUtils.js";

export function useInsightsData({ activeHouseholdId, initialSelectedMonth, supabaseCreditCards }) {
  const [selectedInsightsMonth, setSelectedInsightsMonth] = useState(initialSelectedMonth);
  const [insightsBudgets, setInsightsBudgets] = useState([]);
  const [insightsTransactions, setInsightsTransactions] = useState([]);
  const [ytdBudgetsByMonth, setYtdBudgetsByMonth] = useState({});
  const [ytdTransactionsByMonth, setYtdTransactionsByMonth] = useState({});
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");

  const loadInsightsData = useCallback(async () => {
    if (!activeHouseholdId) {
      setInsightsBudgets([]);
      setInsightsTransactions([]);
      setYtdBudgetsByMonth({});
      setYtdTransactionsByMonth({});
      setInsightsLoading(false);
      return;
    }

    setInsightsLoading(true);
    setInsightsError("");

    try {
      const monthKeys = formatMonthKeyRange(selectedInsightsMonth);
      const monthPairs = await Promise.all(
        monthKeys.map(async (monthKey) => {
          const budgets = await listBudgetCategories(activeHouseholdId, monthKey);
          const transactions = await listTransactions(
            activeHouseholdId,
            monthKey,
            supabaseCreditCards,
            budgets,
          );
          return [monthKey, { budgets, transactions }];
        }),
      );

      const byMonth = Object.fromEntries(monthPairs);
      const budgets = byMonth[selectedInsightsMonth]?.budgets ?? [];
      const transactions = byMonth[selectedInsightsMonth]?.transactions ?? [];

      setInsightsBudgets(budgets);
      setInsightsTransactions(transactions);
      setYtdBudgetsByMonth(
        Object.fromEntries(
          monthKeys.map((monthKey) => [monthKey, byMonth[monthKey]?.budgets ?? []]),
        ),
      );
      setYtdTransactionsByMonth(
        Object.fromEntries(
          monthKeys.map((monthKey) => [monthKey, byMonth[monthKey]?.transactions ?? []]),
        ),
      );
    } catch (error) {
      setInsightsError(error.message || "Could not load insights data.");
      setInsightsBudgets([]);
      setInsightsTransactions([]);
      setYtdBudgetsByMonth({});
      setYtdTransactionsByMonth({});
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
    ytdBudgetsByMonth,
    ytdTransactionsByMonth,
    insightsLoading,
    insightsError,
    loadInsightsData,
  };
}
