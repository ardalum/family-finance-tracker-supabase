import { useCallback, useEffect, useState } from "react";
import {
  createBudgetCategoryRefreshers,
  runRefreshSequence,
} from "../../app/refreshDataUtils.js";
import { defaultBudgetCategories } from "./budgetDefaults.js";
import {
  addBudgetCategoryToSupabase,
  copyPreviousMonthBudgetCategories,
  deleteBudgetCategoryFromSupabase,
  importLocalBudgetCategories,
  listBudgetCategories,
  updateBudgetCategoryInSupabase,
} from "./budgetsSupabaseService.js";

export function useBudgets({
  activeHouseholdId,
  initialSelectedMonth,
  loadSpendingCategories,
  loadDashboardData,
  loadInsightsData,
  localBudgetsByMonth,
}) {
  const [supabaseBudgets, setSupabaseBudgets] = useState([]);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(initialSelectedMonth);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsSaving, setBudgetsSaving] = useState(false);
  const [budgetsError, setBudgetsError] = useState("");

  const loadSupabaseBudgets = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseBudgets([]);
      setBudgetsLoading(false);
      return [];
    }

    setBudgetsLoading(true);
    setBudgetsError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedBudgetMonth);
      setSupabaseBudgets(budgets);
      return budgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not load budget categories.");
      setSupabaseBudgets([]);
      return [];
    } finally {
      setBudgetsLoading(false);
    }
  }, [activeHouseholdId, selectedBudgetMonth]);

  useEffect(() => {
    loadSupabaseBudgets();
  }, [loadSupabaseBudgets]);

  const refreshAfterBudgetCategoryChange = useCallback(
    () =>
      runRefreshSequence(
        createBudgetCategoryRefreshers({
          loadSpendingCategories,
          loadDashboardData,
          loadInsightsData,
        }),
      ),
    [loadDashboardData, loadInsightsData, loadSpendingCategories],
  );

  const createSupabaseBudget = useCallback(
    async (input) => {
      setBudgetsSaving(true);
      setBudgetsError("");

      try {
        const budget = await addBudgetCategoryToSupabase(
          activeHouseholdId,
          selectedBudgetMonth,
          input,
        );
        setSupabaseBudgets((budgets) => [...budgets, budget]);
        await refreshAfterBudgetCategoryChange();
        return budget;
      } catch (error) {
        setBudgetsError(error.message || "Could not add budget category.");
        throw error;
      } finally {
        setBudgetsSaving(false);
      }
    },
    [activeHouseholdId, refreshAfterBudgetCategoryChange, selectedBudgetMonth],
  );

  const updateSupabaseBudget = useCallback(
    async (budgetId, input) => {
      setBudgetsSaving(true);
      setBudgetsError("");

      try {
        const budget = await updateBudgetCategoryInSupabase(budgetId, input);
        setSupabaseBudgets((budgets) =>
          budgets.map((currentBudget) => (currentBudget.id === budget.id ? budget : currentBudget)),
        );
        await refreshAfterBudgetCategoryChange();
        return budget;
      } catch (error) {
        setBudgetsError(error.message || "Could not update budget category.");
        throw error;
      } finally {
        setBudgetsSaving(false);
      }
    },
    [refreshAfterBudgetCategoryChange],
  );

  const deleteSupabaseBudget = useCallback(
    async (budgetId) => {
      setBudgetsSaving(true);
      setBudgetsError("");

      try {
        await deleteBudgetCategoryFromSupabase(budgetId);
        setSupabaseBudgets((budgets) =>
          budgets.filter((budget) => (budget.supabaseId ?? budget.id) !== budgetId),
        );
        await refreshAfterBudgetCategoryChange();
      } catch (error) {
        setBudgetsError(error.message || "Could not delete budget category.");
        throw error;
      } finally {
        setBudgetsSaving(false);
      }
    },
    [refreshAfterBudgetCategoryChange],
  );

  const importSupabaseBudgetCategories = useCallback(async () => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const importedBudgets = await importLocalBudgetCategories(activeHouseholdId, {
        [selectedBudgetMonth]: localBudgetsByMonth?.[selectedBudgetMonth] ?? [],
      });
      await runRefreshSequence([
        loadSupabaseBudgets,
        ...createBudgetCategoryRefreshers({
          loadSpendingCategories,
          loadDashboardData,
          loadInsightsData,
        }),
      ]);
      return importedBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not import local budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [
    activeHouseholdId,
    loadDashboardData,
    loadInsightsData,
    loadSpendingCategories,
    loadSupabaseBudgets,
    localBudgetsByMonth,
    selectedBudgetMonth,
  ]);

  const addDefaultBudgetCategories = useCallback(async () => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const existingNames = new Set(
        supabaseBudgets.map((budget) => budget.name.trim().toLowerCase()),
      );
      const missingCategories = defaultBudgetCategories.filter(
        (name) => !existingNames.has(name.trim().toLowerCase()),
      );

      if (missingCategories.length === 0) return [];

      const createdBudgets = [];
      for (const name of missingCategories) {
        const budget = await addBudgetCategoryToSupabase(activeHouseholdId, selectedBudgetMonth, {
          name,
          monthlyAmount: 0,
          notes: "",
        });
        createdBudgets.push(budget);
      }

      setSupabaseBudgets((budgets) => [...budgets, ...createdBudgets]);
      await refreshAfterBudgetCategoryChange();
      return createdBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not add default budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [activeHouseholdId, refreshAfterBudgetCategoryChange, selectedBudgetMonth, supabaseBudgets]);

  const copyPreviousMonthBudgetCategoriesToSupabase = useCallback(async () => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const copiedBudgets = await copyPreviousMonthBudgetCategories(
        activeHouseholdId,
        selectedBudgetMonth,
      );

      await runRefreshSequence([
        loadSupabaseBudgets,
        ...createBudgetCategoryRefreshers({
          loadSpendingCategories,
          loadDashboardData,
          loadInsightsData,
        }),
      ]);

      return copiedBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not copy previous month budget.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [
    activeHouseholdId,
    loadDashboardData,
    loadInsightsData,
    loadSpendingCategories,
    loadSupabaseBudgets,
    selectedBudgetMonth,
  ]);

  return {
    supabaseBudgets,
    selectedBudgetMonth,
    setSelectedBudgetMonth,
    budgetsLoading,
    budgetsSaving,
    budgetsError,
    loadSupabaseBudgets,
    createSupabaseBudget,
    updateSupabaseBudget,
    deleteSupabaseBudget,
    addDefaultBudgetCategories,
    copyPreviousMonthBudgetCategories: copyPreviousMonthBudgetCategoriesToSupabase,
    importSupabaseBudgetCategories,
  };
}
