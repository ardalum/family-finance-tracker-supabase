import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";

export function useSpendingCategories({ activeHouseholdId, selectedSpendingMonth }) {
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [spendingCategoriesLoading, setSpendingCategoriesLoading] = useState(true);
  const [spendingCategoriesError, setSpendingCategoriesError] = useState("");

  const loadSpendingCategories = useCallback(async () => {
    if (!activeHouseholdId) {
      setSpendingCategories([]);
      setSpendingCategoriesLoading(false);
      return [];
    }

    setSpendingCategoriesLoading(true);
    setSpendingCategoriesError("");

    try {
      const categories = await listBudgetCategories(activeHouseholdId, selectedSpendingMonth);
      setSpendingCategories(categories);
      return categories;
    } catch (error) {
      setSpendingCategoriesError(error.message || "Could not load spending categories.");
      setSpendingCategories([]);
      return [];
    } finally {
      setSpendingCategoriesLoading(false);
    }
  }, [activeHouseholdId, selectedSpendingMonth]);

  useEffect(() => {
    loadSpendingCategories();
  }, [loadSpendingCategories]);

  return {
    spendingCategories,
    spendingCategoriesLoading,
    spendingCategoriesError,
    loadSpendingCategories,
  };
}
