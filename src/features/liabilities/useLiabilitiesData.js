import { useCallback, useEffect, useState } from "react";
import {
  createLiabilityAccount,
  createLiabilityBalanceSnapshot,
  deleteLiabilityAccount,
  deleteLiabilityBalanceSnapshot,
  listLiabilityAccounts,
  listLiabilityBalanceSnapshots,
  updateLiabilityAccount,
  updateLiabilityBalanceSnapshot,
} from "./liabilitiesSupabaseService.js";

export function useLiabilitiesData({ activeHouseholdId }) {
  const [liabilityAccounts, setLiabilityAccounts] = useState([]);
  const [liabilityBalanceSnapshots, setLiabilityBalanceSnapshots] = useState([]);
  const [liabilitiesLoading, setLiabilitiesLoading] = useState(true);
  const [liabilitiesSaving, setLiabilitiesSaving] = useState(false);
  const [liabilitiesError, setLiabilitiesError] = useState("");

  const loadLiabilitiesData = useCallback(async () => {
    if (!activeHouseholdId) {
      setLiabilityAccounts([]);
      setLiabilityBalanceSnapshots([]);
      setLiabilitiesLoading(false);
      return { liabilityAccounts: [], liabilityBalanceSnapshots: [] };
    }

    setLiabilitiesLoading(true);
    setLiabilitiesError("");

    try {
      const [accounts, snapshots] = await Promise.all([
        listLiabilityAccounts(activeHouseholdId),
        listLiabilityBalanceSnapshots(activeHouseholdId),
      ]);
      setLiabilityAccounts(accounts);
      setLiabilityBalanceSnapshots(snapshots);
      return { liabilityAccounts: accounts, liabilityBalanceSnapshots: snapshots };
    } catch (error) {
      setLiabilitiesError(error.message || "Could not load debt balance data.");
      setLiabilityAccounts([]);
      setLiabilityBalanceSnapshots([]);
      return { liabilityAccounts: [], liabilityBalanceSnapshots: [] };
    } finally {
      setLiabilitiesLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadLiabilitiesData();
  }, [loadLiabilitiesData]);

  const createSupabaseLiabilityAccount = useCallback(
    async (payload) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await createLiabilityAccount(activeHouseholdId, payload);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not add liability account.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [activeHouseholdId, loadLiabilitiesData],
  );

  const updateSupabaseLiabilityAccount = useCallback(
    async (accountId, payload) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await updateLiabilityAccount(accountId, payload);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not update liability account.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [loadLiabilitiesData],
  );

  const deleteSupabaseLiabilityAccount = useCallback(
    async (accountId) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await deleteLiabilityAccount(accountId);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not delete liability account.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [loadLiabilitiesData],
  );

  const createSupabaseLiabilityBalanceSnapshot = useCallback(
    async (payload) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await createLiabilityBalanceSnapshot(activeHouseholdId, payload);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not add debt balance snapshot.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [activeHouseholdId, loadLiabilitiesData],
  );

  const updateSupabaseLiabilityBalanceSnapshot = useCallback(
    async (snapshotId, payload) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await updateLiabilityBalanceSnapshot(snapshotId, payload);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not update debt balance snapshot.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [loadLiabilitiesData],
  );

  const deleteSupabaseLiabilityBalanceSnapshot = useCallback(
    async (snapshotId) => {
      setLiabilitiesSaving(true);
      setLiabilitiesError("");
      try {
        await deleteLiabilityBalanceSnapshot(snapshotId);
        await loadLiabilitiesData();
      } catch (error) {
        setLiabilitiesError(error.message || "Could not delete debt balance snapshot.");
        throw error;
      } finally {
        setLiabilitiesSaving(false);
      }
    },
    [loadLiabilitiesData],
  );

  return {
    liabilityAccounts,
    liabilityBalanceSnapshots,
    liabilitiesLoading,
    liabilitiesSaving,
    liabilitiesError,
    loadLiabilitiesData,
    createSupabaseLiabilityAccount,
    updateSupabaseLiabilityAccount,
    deleteSupabaseLiabilityAccount,
    createSupabaseLiabilityBalanceSnapshot,
    updateSupabaseLiabilityBalanceSnapshot,
    deleteSupabaseLiabilityBalanceSnapshot,
  };
}
