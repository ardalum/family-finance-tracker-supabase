import { useCallback, useEffect, useState } from "react";
import {
  createRecurringDashboardInsightsRefreshers,
  createRecurringSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "../../app/refreshDataUtils.js";
import {
  addRecurringPaymentToSupabase,
  deleteRecurringPaymentFromSupabase,
  importLocalRecurringPayments,
  listRecurringInstances,
  listRecurringPayments,
  markRecurringPaymentPaidInSupabase,
  markRecurringPaymentUnpaidInSupabase,
  skipRecurringPaymentInSupabase,
  updateRecurringPaymentInSupabase,
} from "./recurringSupabaseService.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";

export function useRecurringPayments({
  activeHouseholdId,
  initialSelectedMonth,
  supabaseCreditCards,
  recurringCategories,
  loadSpendingTransactions,
  loadDashboardData,
  loadInsightsData,
  localRecurringPayments,
}) {
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [recurringStatusByMonth, setRecurringStatusByMonth] = useState({});
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [selectedRecurringMonth, setSelectedRecurringMonth] = useState(initialSelectedMonth);
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [recurringSaving, setRecurringSaving] = useState(false);
  const [recurringError, setRecurringError] = useState("");

  const loadRecurringData = useCallback(async () => {
    if (!activeHouseholdId) {
      setRecurringPayments([]);
      setRecurringStatusByMonth({});
      setRecurringTransactions([]);
      setRecurringLoading(false);
      return;
    }

    setRecurringLoading(true);
    setRecurringError("");

    try {
      const templates = await listRecurringPayments(
        activeHouseholdId,
        supabaseCreditCards,
        recurringCategories,
      );
      const statuses = await listRecurringInstances(activeHouseholdId, templates);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedRecurringMonth,
        supabaseCreditCards,
        recurringCategories,
      );

      setRecurringPayments(templates);
      setRecurringStatusByMonth(statuses);
      setRecurringTransactions(transactions);
    } catch (error) {
      setRecurringError(error.message || "Could not load recurring payments.");
      setRecurringPayments([]);
      setRecurringStatusByMonth({});
      setRecurringTransactions([]);
    } finally {
      setRecurringLoading(false);
    }
  }, [activeHouseholdId, recurringCategories, selectedRecurringMonth, supabaseCreditCards]);

  useEffect(() => {
    loadRecurringData();
  }, [loadRecurringData]);

  const createSupabaseRecurringPayment = useCallback(
    async (input) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await addRecurringPaymentToSupabase(
          activeHouseholdId,
          input,
          supabaseCreditCards,
          recurringCategories,
        );
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not add recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      recurringCategories,
      supabaseCreditCards,
    ],
  );

  const updateSupabaseRecurringPayment = useCallback(
    async (templateId, input) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await updateRecurringPaymentInSupabase(
          templateId,
          input,
          supabaseCreditCards,
          recurringCategories,
        );
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not update recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      recurringCategories,
      supabaseCreditCards,
    ],
  );

  const deleteSupabaseRecurringPayment = useCallback(
    async (templateId) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await deleteRecurringPaymentFromSupabase(templateId);
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not delete recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [loadDashboardData, loadInsightsData, loadRecurringData],
  );

  const markSupabaseRecurringPaid = useCallback(
    async (row) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await markRecurringPaymentPaidInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          row,
          cards: supabaseCreditCards,
          categories: recurringCategories,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not mark recurring payment paid.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      recurringCategories,
      selectedRecurringMonth,
      supabaseCreditCards,
    ],
  );

  const markSupabaseRecurringUnpaid = useCallback(
    async (template) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await markRecurringPaymentUnpaidInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          template,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not mark recurring payment unpaid.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      selectedRecurringMonth,
    ],
  );

  const skipSupabaseRecurringPayment = useCallback(
    async (template) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await skipRecurringPaymentInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          template,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not skip recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      selectedRecurringMonth,
    ],
  );

  const importSupabaseRecurringPayments = useCallback(async () => {
    setRecurringSaving(true);
    setRecurringError("");

    try {
      const imported = await importLocalRecurringPayments(
        activeHouseholdId,
        localRecurringPayments,
        supabaseCreditCards,
        recurringCategories,
      );
      await runRefreshSequence(
        createRecurringDashboardInsightsRefreshers({
          loadRecurringData,
          loadDashboardData,
          loadInsightsData,
        }),
      );
      return imported;
    } catch (error) {
      setRecurringError(error.message || "Could not import local recurring payments.");
      throw error;
    } finally {
      setRecurringSaving(false);
    }
  }, [
    activeHouseholdId,
    localRecurringPayments,
    loadDashboardData,
    loadInsightsData,
    loadRecurringData,
    recurringCategories,
    supabaseCreditCards,
  ]);

  const markSupabaseRecurringPayment = markSupabaseRecurringPaid;
  const generateSupabaseRecurringTransaction = markSupabaseRecurringPaid;

  return {
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions,
    selectedRecurringMonth,
    setSelectedRecurringMonth,
    recurringLoading,
    recurringSaving,
    recurringError,
    loadRecurringData,
    createSupabaseRecurringPayment,
    updateSupabaseRecurringPayment,
    deleteSupabaseRecurringPayment,
    markSupabaseRecurringPayment,
    generateSupabaseRecurringTransaction,
    importSupabaseRecurringPayments,
    markSupabaseRecurringPaid,
    markSupabaseRecurringUnpaid,
    skipSupabaseRecurringPayment,
  };
}
