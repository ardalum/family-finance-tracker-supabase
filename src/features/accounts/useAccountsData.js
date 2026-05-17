import { useCallback, useEffect, useState } from "react";
import {
  createAccountBalanceSnapshot,
  createCashAccount,
  deleteAccountBalanceSnapshot,
  deleteCashAccount,
  listAccountBalanceSnapshots,
  listCashAccounts,
  updateAccountBalanceSnapshot,
  updateCashAccount,
} from "./accountsSupabaseService.js";

export function useAccountsData({ activeHouseholdId }) {
  const [cashAccounts, setCashAccounts] = useState([]);
  const [accountBalanceSnapshots, setAccountBalanceSnapshots] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsSaving, setAccountsSaving] = useState(false);
  const [accountsError, setAccountsError] = useState("");

  const loadAccountsData = useCallback(async () => {
    if (!activeHouseholdId) {
      setCashAccounts([]);
      setAccountBalanceSnapshots([]);
      setAccountsLoading(false);
      return { cashAccounts: [], accountBalanceSnapshots: [] };
    }

    setAccountsLoading(true);
    setAccountsError("");

    try {
      const [accounts, snapshots] = await Promise.all([
        listCashAccounts(activeHouseholdId),
        listAccountBalanceSnapshots(activeHouseholdId),
      ]);
      setCashAccounts(accounts);
      setAccountBalanceSnapshots(snapshots);
      return { cashAccounts: accounts, accountBalanceSnapshots: snapshots };
    } catch (error) {
      setAccountsError(error.message || "Could not load account balances.");
      setCashAccounts([]);
      setAccountBalanceSnapshots([]);
      return { cashAccounts: [], accountBalanceSnapshots: [] };
    } finally {
      setAccountsLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadAccountsData();
  }, [loadAccountsData]);

  const createSupabaseCashAccount = useCallback(
    async (payload) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await createCashAccount(activeHouseholdId, payload);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not add cash account.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [activeHouseholdId, loadAccountsData],
  );

  const updateSupabaseCashAccount = useCallback(
    async (accountId, payload) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await updateCashAccount(accountId, payload);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not update cash account.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [loadAccountsData],
  );

  const deleteSupabaseCashAccount = useCallback(
    async (accountId) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await deleteCashAccount(accountId);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not delete cash account.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [loadAccountsData],
  );

  const createSupabaseAccountBalanceSnapshot = useCallback(
    async (payload) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await createAccountBalanceSnapshot(activeHouseholdId, payload);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not add balance snapshot.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [activeHouseholdId, loadAccountsData],
  );

  const updateSupabaseAccountBalanceSnapshot = useCallback(
    async (snapshotId, payload) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await updateAccountBalanceSnapshot(snapshotId, payload);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not update balance snapshot.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [loadAccountsData],
  );

  const deleteSupabaseAccountBalanceSnapshot = useCallback(
    async (snapshotId) => {
      setAccountsSaving(true);
      setAccountsError("");
      try {
        await deleteAccountBalanceSnapshot(snapshotId);
        await loadAccountsData();
      } catch (error) {
        setAccountsError(error.message || "Could not delete balance snapshot.");
        throw error;
      } finally {
        setAccountsSaving(false);
      }
    },
    [loadAccountsData],
  );

  return {
    cashAccounts,
    accountBalanceSnapshots,
    accountsLoading,
    accountsSaving,
    accountsError,
    loadAccountsData,
    createSupabaseCashAccount,
    updateSupabaseCashAccount,
    deleteSupabaseCashAccount,
    createSupabaseAccountBalanceSnapshot,
    updateSupabaseAccountBalanceSnapshot,
    deleteSupabaseAccountBalanceSnapshot,
  };
}
