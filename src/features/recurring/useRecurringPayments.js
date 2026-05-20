import { useCallback, useEffect, useState } from "react";
import {
  deleteAccountMoneyMovementBySource,
  listAccountMoneyMovements,
  replaceAccountMoneyMovementBySource,
} from "../accounts/accountMoneyMovementsSupabaseService.js";
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
import {
  buildRecurringBillMovementPayload,
  getRecurringMovementSourceId,
  RECURRING_PAID_FROM_CREDIT_CARD,
} from "./recurringPaymentFlow.js";
import { listTransactions } from "../spending/spendingSupabaseService.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../creditCards/statementPaymentUtils.js";

function applyRecurringPaidFromToStatuses(statuses, templates, movements) {
  const templatesById = new Map(templates.map((template) => [template.id, template]));
  const templatesBySupabaseId = new Map(
    templates.map((template) => [template.supabaseId ?? template.id, template]),
  );
  const movementsBySource = new Map(
    movements
      .filter((movement) => movement.sourceType === "recurring_payment")
      .map((movement) => [movement.sourceId, movement]),
  );

  const result = {};
  Object.entries(statuses ?? {}).forEach(([monthKey, byTemplate]) => {
    result[monthKey] = {};
    Object.entries(byTemplate ?? {}).forEach(([templateId, instance]) => {
      const template = templatesById.get(templateId) ?? templatesBySupabaseId.get(templateId);
      const movementSourceId = getRecurringMovementSourceId(
        template?.supabaseId ?? template?.id ?? templateId,
        monthKey,
      );
      const movement = movementsBySource.get(movementSourceId);
      const paidFromAccount = movement
        ? movement.isTracked === false
          ? CARD_PAYMENT_OUTSIDE_ACCOUNT
          : movement.accountId || ""
        : template?.paymentMethod === "Credit Card" && instance?.status === "paid"
          ? RECURRING_PAID_FROM_CREDIT_CARD
          : "";

      result[monthKey][templateId] = { ...instance, paidFromAccount };
    });
  });
  return result;
}

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
      const [statuses, transactions, movements] = await Promise.all([
        listRecurringInstances(activeHouseholdId, templates),
        listTransactions(
          activeHouseholdId,
          selectedRecurringMonth,
          supabaseCreditCards,
          recurringCategories,
        ),
        listAccountMoneyMovements(activeHouseholdId),
      ]);

      setRecurringPayments(templates);
      setRecurringStatusByMonth(applyRecurringPaidFromToStatuses(statuses, templates, movements));
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
        const movementPayload = buildRecurringBillMovementPayload({
          template: row.template,
          monthKey: selectedRecurringMonth,
          amountPaid: row.actualAmount,
          paidDate: row.paidDate,
          paidFromAccount: row.paidFromAccount,
        });
        const sourceId = getRecurringMovementSourceId(
          row.template.supabaseId ?? row.template.id,
          selectedRecurringMonth,
        );
        if (movementPayload) {
          await replaceAccountMoneyMovementBySource(activeHouseholdId, movementPayload);
        } else {
          await deleteAccountMoneyMovementBySource(
            activeHouseholdId,
            "recurring_payment",
            sourceId,
          );
        }
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
        await deleteAccountMoneyMovementBySource(
          activeHouseholdId,
          "recurring_payment",
          getRecurringMovementSourceId(template.supabaseId ?? template.id, selectedRecurringMonth),
        );
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
        await deleteAccountMoneyMovementBySource(
          activeHouseholdId,
          "recurring_payment",
          getRecurringMovementSourceId(template.supabaseId ?? template.id, selectedRecurringMonth),
        );
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
