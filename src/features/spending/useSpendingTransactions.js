import { useCallback, useEffect, useState } from "react";
import {
  createDashboardInsightsRefreshers,
  createSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "../../app/refreshDataUtils.js";
import {
  listAccountMoneyMovements,
  deleteAccountMoneyMovementBySource,
  replaceAccountMoneyMovementBySource,
} from "../accounts/accountMoneyMovementsSupabaseService.js";
import {
  addTransactionToSupabase,
  deleteTransactionFromSupabase,
  importLocalTransactions,
  listHouseholdMerchantTransactions,
  listTransactions,
  updateTransactionInSupabase,
} from "./spendingSupabaseService.js";
import { buildSpendingOutflowMovementPayload } from "./spendingService.js";

export function useSpendingTransactions({
  activeHouseholdId,
  initialSelectedMonth,
  supabaseCreditCards,
  spendingCategories,
  loadDashboardData,
  loadInsightsData,
}) {
  const [spendingTransactions, setSpendingTransactions] = useState([]);
  const [householdMerchantTransactions, setHouseholdMerchantTransactions] = useState([]);
  const [selectedSpendingMonth, setSelectedSpendingMonth] = useState(initialSelectedMonth);
  const [spendingOutflowMovements, setSpendingOutflowMovements] = useState([]);
  const [spendingLoading, setSpendingLoading] = useState(true);
  const [spendingSaving, setSpendingSaving] = useState(false);
  const [spendingError, setSpendingError] = useState("");

  const loadSpendingTransactions = useCallback(async () => {
    if (!activeHouseholdId) {
      setSpendingTransactions([]);
      setSpendingLoading(false);
      return [];
    }

    setSpendingLoading(true);
    setSpendingError("");

    try {
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedSpendingMonth,
        supabaseCreditCards,
        spendingCategories,
      );
      setSpendingTransactions(transactions);
      return transactions;
    } catch (error) {
      setSpendingError(error.message || "Could not load spending transactions.");
      setSpendingTransactions([]);
      return [];
    } finally {
      setSpendingLoading(false);
    }
  }, [activeHouseholdId, selectedSpendingMonth, spendingCategories, supabaseCreditCards]);

  const loadHouseholdMerchantTransactions = useCallback(async () => {
    if (!activeHouseholdId) {
      setHouseholdMerchantTransactions([]);
      return [];
    }

    try {
      const transactions = await listHouseholdMerchantTransactions(
        activeHouseholdId,
        supabaseCreditCards,
        spendingCategories,
      );
      setHouseholdMerchantTransactions(transactions);
      return transactions;
    } catch {
      setHouseholdMerchantTransactions([]);
      return [];
    }
  }, [activeHouseholdId, spendingCategories, supabaseCreditCards]);

  const loadSpendingOutflowMovements = useCallback(async () => {
    if (!activeHouseholdId) {
      setSpendingOutflowMovements([]);
      return [];
    }

    try {
      const movements = await listAccountMoneyMovements(activeHouseholdId);
      const spendingOutflows = movements.filter(
        (movement) =>
          movement.sourceType === "spending_transaction" &&
          movement.movementType === "spending_payment" &&
          movement.direction === "outflow" &&
          movement.isTracked !== false &&
          movement.accountId,
      );
      setSpendingOutflowMovements(spendingOutflows);
      return spendingOutflows;
    } catch {
      setSpendingOutflowMovements([]);
      return [];
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadSpendingTransactions();
  }, [loadSpendingTransactions]);

  useEffect(() => {
    loadHouseholdMerchantTransactions();
  }, [loadHouseholdMerchantTransactions]);

  useEffect(() => {
    loadSpendingOutflowMovements();
  }, [loadSpendingOutflowMovements]);

  const createSupabaseTransaction = useCallback(
    async (input) => {
      setSpendingSaving(true);
      setSpendingError("");

      try {
        const transactionId = await addTransactionToSupabase(
          activeHouseholdId,
          input,
          supabaseCreditCards,
          spendingCategories,
        );
        const movementPayload = buildSpendingOutflowMovementPayload(
          { ...input, supabaseId: transactionId },
          input.sourceAccountId,
        );
        if (movementPayload) {
          await replaceAccountMoneyMovementBySource(activeHouseholdId, movementPayload);
        } else {
          await deleteAccountMoneyMovementBySource(
            activeHouseholdId,
            "spending_transaction",
            transactionId,
          );
        }
        await runRefreshSequence(
          createSpendingDashboardInsightsRefreshers({
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        await loadHouseholdMerchantTransactions();
        await loadSpendingOutflowMovements();
      } catch (error) {
        setSpendingError(error.message || "Could not add transaction.");
        throw error;
      } finally {
        setSpendingSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadHouseholdMerchantTransactions,
      loadInsightsData,
      loadSpendingTransactions,
      loadSpendingOutflowMovements,
      spendingCategories,
      supabaseCreditCards,
    ],
  );

  const updateSupabaseTransaction = useCallback(
    async (transactionId, input) => {
      setSpendingSaving(true);
      setSpendingError("");

      try {
        await updateTransactionInSupabase(
          transactionId,
          input,
          supabaseCreditCards,
          spendingCategories,
        );
        const movementPayload = buildSpendingOutflowMovementPayload(
          { ...input, supabaseId: transactionId },
          input.sourceAccountId,
        );
        if (movementPayload) {
          await replaceAccountMoneyMovementBySource(activeHouseholdId, movementPayload);
        } else {
          await deleteAccountMoneyMovementBySource(
            activeHouseholdId,
            "spending_transaction",
            transactionId,
          );
        }
        await runRefreshSequence(
          createSpendingDashboardInsightsRefreshers({
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        await loadHouseholdMerchantTransactions();
        await loadSpendingOutflowMovements();
      } catch (error) {
        setSpendingError(error.message || "Could not update transaction.");
        throw error;
      } finally {
        setSpendingSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadHouseholdMerchantTransactions,
      loadInsightsData,
      loadSpendingTransactions,
      loadSpendingOutflowMovements,
      spendingCategories,
      supabaseCreditCards,
    ],
  );

  const deleteSupabaseTransaction = useCallback(
    async (transactionId) => {
      setSpendingSaving(true);
      setSpendingError("");

      try {
        await deleteTransactionFromSupabase(transactionId);
        await deleteAccountMoneyMovementBySource(
          activeHouseholdId,
          "spending_transaction",
          transactionId,
        );
        setSpendingTransactions((transactions) =>
          transactions.filter(
            (transaction) => (transaction.supabaseId ?? transaction.id) !== transactionId,
          ),
        );
        setHouseholdMerchantTransactions((transactions) =>
          transactions.filter(
            (transaction) => (transaction.supabaseId ?? transaction.id) !== transactionId,
          ),
        );
        await runRefreshSequence(
          createDashboardInsightsRefreshers({
            loadDashboardData,
            loadInsightsData,
          }),
        );
        await loadSpendingOutflowMovements();
      } catch (error) {
        setSpendingError(error.message || "Could not delete transaction.");
        throw error;
      } finally {
        setSpendingSaving(false);
      }
    },
    [activeHouseholdId, loadDashboardData, loadInsightsData, loadSpendingOutflowMovements],
  );

  const importSupabaseTransactions = useCallback(
    async (localMonthTransactions) => {
      setSpendingSaving(true);
      setSpendingError("");

      try {
        const importedIds = await importLocalTransactions(
          activeHouseholdId,
          localMonthTransactions,
          supabaseCreditCards,
          spendingCategories,
        );
        await runRefreshSequence([loadSpendingTransactions, loadDashboardData]);
        await loadHouseholdMerchantTransactions();
        await loadSpendingOutflowMovements();
        return importedIds;
      } catch (error) {
        setSpendingError(error.message || "Could not import local spending transactions.");
        throw error;
      } finally {
        setSpendingSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadHouseholdMerchantTransactions,
      loadSpendingTransactions,
      loadSpendingOutflowMovements,
      spendingCategories,
      supabaseCreditCards,
    ],
  );

  return {
    spendingTransactions,
    householdMerchantTransactions,
    spendingOutflowMovements,
    selectedSpendingMonth,
    setSelectedSpendingMonth,
    spendingLoading,
    spendingSaving,
    spendingError,
    loadSpendingTransactions,
    loadHouseholdMerchantTransactions,
    createSupabaseTransaction,
    updateSupabaseTransaction,
    deleteSupabaseTransaction,
    importSupabaseTransactions,
  };
}
