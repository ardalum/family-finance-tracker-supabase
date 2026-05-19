import { useCallback, useEffect, useState } from "react";
import {
  deleteAccountMoneyMovementBySource,
  listAccountMoneyMovements,
  replaceAccountMoneyMovementBySource,
} from "../accounts/accountMoneyMovementsSupabaseService.js";
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
import { buildIncomeDepositMovementPayload } from "./incomeService.js";

function isIncomeDepositMovement(movement) {
  return movement.sourceType === "income_entry" && movement.movementType === "income_deposit";
}

export function useIncomeData({ activeHouseholdId }) {
  const [incomeSources, setIncomeSources] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [incomeDepositMovements, setIncomeDepositMovements] = useState([]);
  const [incomeLoading, setIncomeLoading] = useState(true);
  const [incomeSaving, setIncomeSaving] = useState(false);
  const [incomeError, setIncomeError] = useState("");

  const loadIncomeData = useCallback(async () => {
    if (!activeHouseholdId) {
      setIncomeSources([]);
      setIncomeEntries([]);
      setIncomeDepositMovements([]);
      setIncomeLoading(false);
      return { incomeSources: [], incomeEntries: [], incomeDepositMovements: [] };
    }

    setIncomeLoading(true);
    setIncomeError("");

    try {
      const [sources, entries, movements] = await Promise.all([
        listIncomeSources(activeHouseholdId),
        listIncomeEntries(activeHouseholdId),
        listAccountMoneyMovements(activeHouseholdId),
      ]);
      const incomeMovements = movements.filter(isIncomeDepositMovement);
      setIncomeSources(sources);
      setIncomeEntries(entries);
      setIncomeDepositMovements(incomeMovements);
      return {
        incomeSources: sources,
        incomeEntries: entries,
        incomeDepositMovements: incomeMovements,
      };
    } catch (error) {
      setIncomeError(error.message || "Could not load income data.");
      setIncomeSources([]);
      setIncomeEntries([]);
      setIncomeDepositMovements([]);
      return { incomeSources: [], incomeEntries: [], incomeDepositMovements: [] };
    } finally {
      setIncomeLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadIncomeData();
  }, [loadIncomeData]);

  const saveIncomeDepositMovement = useCallback(
    async (entry, payload) => {
      const movementPayload = buildIncomeDepositMovementPayload(entry, payload.depositAccountId);

      if (!movementPayload) {
        await deleteAccountMoneyMovementBySource(
          activeHouseholdId,
          "income_entry",
          entry.supabaseId ?? entry.id,
        );
        return;
      }

      await replaceAccountMoneyMovementBySource(activeHouseholdId, movementPayload);
    },
    [activeHouseholdId],
  );

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
        const entry = await createIncomeEntry(activeHouseholdId, payload);
        await saveIncomeDepositMovement(entry, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not add income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [activeHouseholdId, loadIncomeData, saveIncomeDepositMovement],
  );

  const updateSupabaseIncomeEntry = useCallback(
    async (entryId, payload) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        const entry = await updateIncomeEntry(entryId, payload);
        await saveIncomeDepositMovement(entry, payload);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not update income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [loadIncomeData, saveIncomeDepositMovement],
  );

  const deleteSupabaseIncomeEntry = useCallback(
    async (entryId) => {
      setIncomeSaving(true);
      setIncomeError("");

      try {
        await deleteIncomeEntry(entryId);
        await deleteAccountMoneyMovementBySource(activeHouseholdId, "income_entry", entryId);
        await loadIncomeData();
      } catch (error) {
        setIncomeError(error.message || "Could not delete income entry.");
        throw error;
      } finally {
        setIncomeSaving(false);
      }
    },
    [activeHouseholdId, loadIncomeData],
  );

  return {
    incomeSources,
    incomeEntries,
    incomeDepositMovements,
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
