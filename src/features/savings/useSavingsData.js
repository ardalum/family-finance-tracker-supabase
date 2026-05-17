import { useCallback, useEffect, useState } from "react";
import {
  createSavingsContribution,
  createSavingsGoal,
  deleteSavingsContribution,
  deleteSavingsGoal,
  listSavingsContributions,
  listSavingsGoals,
  updateSavingsContribution,
  updateSavingsGoal,
} from "./savingsSupabaseService.js";

export function useSavingsData({ activeHouseholdId }) {
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [savingsContributions, setSavingsContributions] = useState([]);
  const [savingsLoading, setSavingsLoading] = useState(true);
  const [savingsSaving, setSavingsSaving] = useState(false);
  const [savingsError, setSavingsError] = useState("");

  const loadSavingsData = useCallback(async () => {
    if (!activeHouseholdId) {
      setSavingsGoals([]);
      setSavingsContributions([]);
      setSavingsLoading(false);
      return { savingsGoals: [], savingsContributions: [] };
    }

    setSavingsLoading(true);
    setSavingsError("");

    try {
      const [goals, contributions] = await Promise.all([
        listSavingsGoals(activeHouseholdId),
        listSavingsContributions(activeHouseholdId),
      ]);
      setSavingsGoals(goals);
      setSavingsContributions(contributions);
      return { savingsGoals: goals, savingsContributions: contributions };
    } catch (error) {
      setSavingsError(error.message || "Could not load savings data.");
      setSavingsGoals([]);
      setSavingsContributions([]);
      return { savingsGoals: [], savingsContributions: [] };
    } finally {
      setSavingsLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadSavingsData();
  }, [loadSavingsData]);

  const createSupabaseSavingsGoal = useCallback(
    async (payload) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await createSavingsGoal(activeHouseholdId, payload);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not add savings goal.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [activeHouseholdId, loadSavingsData],
  );

  const updateSupabaseSavingsGoal = useCallback(
    async (goalId, payload) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await updateSavingsGoal(goalId, payload);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not update savings goal.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [loadSavingsData],
  );

  const deleteSupabaseSavingsGoal = useCallback(
    async (goalId) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await deleteSavingsGoal(goalId);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not delete savings goal.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [loadSavingsData],
  );

  const createSupabaseSavingsContribution = useCallback(
    async (payload) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await createSavingsContribution(activeHouseholdId, payload);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not add savings contribution.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [activeHouseholdId, loadSavingsData],
  );

  const updateSupabaseSavingsContribution = useCallback(
    async (contributionId, payload) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await updateSavingsContribution(contributionId, payload);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not update savings contribution.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [loadSavingsData],
  );

  const deleteSupabaseSavingsContribution = useCallback(
    async (contributionId) => {
      setSavingsSaving(true);
      setSavingsError("");

      try {
        await deleteSavingsContribution(contributionId);
        await loadSavingsData();
      } catch (error) {
        setSavingsError(error.message || "Could not delete savings contribution.");
        throw error;
      } finally {
        setSavingsSaving(false);
      }
    },
    [loadSavingsData],
  );

  return {
    savingsGoals,
    savingsContributions,
    savingsLoading,
    savingsSaving,
    savingsError,
    loadSavingsData,
    createSupabaseSavingsGoal,
    updateSupabaseSavingsGoal,
    deleteSupabaseSavingsGoal,
    createSupabaseSavingsContribution,
    updateSupabaseSavingsContribution,
    deleteSupabaseSavingsContribution,
  };
}
