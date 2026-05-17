import { useCallback, useEffect, useState } from "react";
import {
  createIncomeEntry,
  createIncomeSource,
  deleteIncomeEntry,
  deleteIncomeSource,
  listIncomeEntries,
  listIncomeSources,
  updateIncomeEntry,
  updateIncomeSource,
} from "./incomeSupabaseService.js";

export function useIncomeData({ activeHouseholdId }) {
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [incomeLoading, setIncomeLoading] = useState(true);
  const [incomeSaving, setIncomeSaving] = useState(false);
  const [incomeError, setIncomeError] = useState("");

  const loadIncomeData = useCallback(async () => {
    if (!activeHouseholdId) {
      setIncomeSources([]);
      setIncomeEntries([]);
      setIncomeLoading(false);
      return { incomeSources: [], incomeEntries: [] };
    }

    setIncomeLoading(true);
    setIncomeError("");

    try {
      const [sources, entries] = await Promise.all([
        listIncomeSources(activeHouseholdId),
        listIncomeEntries(activeHouseholdId),
      ]);
      setIncomeSources(sources);
      setIncomeEntries(entries);
      return { incomeSources: sources, incomeEntries: entries };
    } catch (error) {
      setIncomeError(error.message || "Could not load income data.");
      setIncomeSources([]);
      setIncomeEntries([]);
      return { incomeSources: [], incomeEntries: [] };
    } finally {
      setIncomeLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadIncomeData();
  }, [loadIncomeData]);

  const createSupabaseIncomeSource = useCallback(
    async (payload) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await createIncomeSource(activeHouseholdId, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not add income source.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [activeHouseholdId, loadIncomeData],
  );

  const updateSupabaseIncomeSource = useCallback(
    async (sourceId, payload) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await updateIncomeSource(sourceId, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not update income source.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [loadIncomeData],
  );

  const deleteSupabaseIncomeSource = useCallback(
    async (sourceId) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await deleteIncomeSource(sourceId);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not delete income source.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [loadIncomeData],
  );

  const createSupabaseIncomeEntry = useCallback(
    async (payload) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await createIncomeEntry(activeHouseholdId, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not add income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [activeHouseholdId, loadIncomeData],
  );

  const updateSupabaseIncomeEntry = useCallback(
    async (entryId, payload) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await updateIncomeEntry(entryId, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not update income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [loadIncomeData],
  );

  const deleteSupabaseIncomeEntry = useCallback(
    async (entryId) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await deleteIncomeEntry(entryId);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not delete income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [loadIncomeData],
  );

  return {
    incomeSources,
    incomeEntries,
    incomeLoading,
    incomeSaving,
    incomeError,
    loadIncomeData,
    createSupabaseIncomeSource,
    updateSupabaseIncomeSource,
    deleteSupabaseIncomeSource,
    createSupabaseIncomeEntry,
    updateSupabaseIncomeEntry,
    deleteSupabaseIncomeEntry,
  };
}
