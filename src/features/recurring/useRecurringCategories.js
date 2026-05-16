import { useCallback, useEffect, useState } from "react";
import { listBudgetCategories } from "../budgets/budgetsSupabaseService.js";

export function useRecurringCategories({ activeHouseholdId, selectedRecurringMonth }) {
  const [recurringCategories, setRecurringCategories] = useState([]);
  const [recurringCategoriesLoading, setRecurringCategoriesLoading] = useState(true);
  const [recurringCategoriesError, setRecurringCategoriesError] = useState("");

  const loadRecurringCategories = useCallback(async () => {
    if (!activeHouseholdId) {
      setRecurringCategories([]);
      setRecurringCategoriesLoading(false);
      return [];
    }

    setRecurringCategoriesLoading(true);
    setRecurringCategoriesError("");

    try {
      const categories = await listBudgetCategories(activeHouseholdId, selectedRecurringMonth);
      setRecurringCategories(categories);
      return categories;
    } catch (error) {
      setRecurringCategoriesError(error.message || "Could not load recurring categories.");
      setRecurringCategories([]);
      return [];
    } finally {
      setRecurringCategoriesLoading(false);
    }
  }, [activeHouseholdId, selectedRecurringMonth]);

  useEffect(() => {
    loadRecurringCategories();
  }, [loadRecurringCategories]);

  return {
    recurringCategories,
    recurringCategoriesLoading,
    recurringCategoriesError,
    loadRecurringCategories,
  };
}
