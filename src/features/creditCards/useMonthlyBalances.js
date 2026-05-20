import { useCallback, useEffect, useState } from "react";
import {
  deleteAccountMoneyMovementBySource,
  replaceAccountMoneyMovementBySource,
} from "../accounts/accountMoneyMovementsSupabaseService.js";
import {
  deleteMonthlyBalance,
  listAllMonthlyBalances,
  upsertMonthlyBalance,
} from "./monthlyBalancesSupabaseService.js";
import {
  buildCreditCardPaymentMovementPayload,
  getCreditCardPaymentMovementSourceId,
} from "./statementPaymentUtils.js";

export function useMonthlyBalances({
  activeHouseholdId,
  supabaseCreditCards,
  initialSelectedMonth,
}) {
  const [supabaseMonthlyBalances, setSupabaseMonthlyBalances] = useState({});
  const [selectedBalanceMonth, setSelectedBalanceMonth] = useState(initialSelectedMonth);
  const [monthlyBalancesLoading, setMonthlyBalancesLoading] = useState(true);
  const [monthlyBalancesSaving, setMonthlyBalancesSaving] = useState(false);
  const [monthlyBalancesError, setMonthlyBalancesError] = useState("");

  const loadSupabaseMonthlyBalances = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseMonthlyBalances({});
      setMonthlyBalancesLoading(false);
      return {};
    }

    setMonthlyBalancesLoading(true);
    setMonthlyBalancesError("");

    try {
      const balances = await listAllMonthlyBalances(activeHouseholdId, supabaseCreditCards);
      setSupabaseMonthlyBalances(balances);
      return balances;
    } catch (error) {
      setMonthlyBalancesError(error.message || "Could not load monthly balances.");
      setSupabaseMonthlyBalances({});
      return {};
    } finally {
      setMonthlyBalancesLoading(false);
    }
  }, [activeHouseholdId, supabaseCreditCards]);

  useEffect(() => {
    loadSupabaseMonthlyBalances();
  }, [loadSupabaseMonthlyBalances, selectedBalanceMonth]);

  const saveSupabaseMonthlyBalance = useCallback(
    async (monthKey, cardId, entry) => {
      const card = supabaseCreditCards.find((currentCard) => currentCard.id === cardId);
      if (!card) return;
      const cardSourceId = card.supabaseId ?? card.id;
      const normalizedBalance = Number(entry?.balance ?? 0) || 0;
      const shouldDelete = !entry || (normalizedBalance <= 0 && entry.paid !== true);

      setMonthlyBalancesError("");
      setSupabaseMonthlyBalances((balances) => {
        const monthEntries = { ...(balances[monthKey] ?? {}) };

        if (shouldDelete) {
          delete monthEntries[cardId];
        } else {
          monthEntries[cardId] = {
            balance: normalizedBalance,
            paid: Boolean(entry.paid),
            checkedNoBalance: normalizedBalance <= 0 && Boolean(entry.paid),
            paidAmount: Number(entry.paidAmount ?? (entry.paid ? normalizedBalance : 0)) || 0,
            paymentDueDate: entry.paymentDueDate ?? null,
            statementCloseDate: entry.statementCloseDate ?? null,
            minimumPayment: Number(entry.minimumPayment ?? 0) || 0,
            paidDate: entry.paidDate ?? null,
            autopayEnabled: Boolean(entry.autopayEnabled),
            autopayDate: entry.autopayDate ?? null,
            confirmationNumber: entry.confirmationNumber ?? "",
            paymentAccountId: entry.paymentAccountId ?? "",
            updatedAt: new Date().toISOString(),
          };
        }

        return {
          ...balances,
          [monthKey]: monthEntries,
        };
      });

      setMonthlyBalancesSaving(true);

      try {
        if (shouldDelete) {
          await deleteMonthlyBalance(activeHouseholdId, monthKey, card);
          await deleteAccountMoneyMovementBySource(
            activeHouseholdId,
            "credit_card_payment",
            getCreditCardPaymentMovementSourceId(cardSourceId, monthKey),
          );
        } else {
          await upsertMonthlyBalance(activeHouseholdId, monthKey, card, entry);
          const movementPayload = buildCreditCardPaymentMovementPayload({
            creditCardId: cardSourceId,
            monthKey,
            paidAmount: entry.paidAmount ?? (entry.paid ? normalizedBalance : 0),
            paidDate: entry.paidDate ?? null,
            paymentAccountId: entry.paymentAccountId,
            cardName: card.name,
          });
          if (movementPayload) {
            await replaceAccountMoneyMovementBySource(activeHouseholdId, movementPayload);
          } else {
            await deleteAccountMoneyMovementBySource(
              activeHouseholdId,
              "credit_card_payment",
              getCreditCardPaymentMovementSourceId(cardSourceId, monthKey),
            );
          }
        }
      } catch (error) {
        setMonthlyBalancesError(error.message || "Could not save monthly balance.");
        await loadSupabaseMonthlyBalances();
        throw error;
      } finally {
        setMonthlyBalancesSaving(false);
      }
    },
    [activeHouseholdId, loadSupabaseMonthlyBalances, supabaseCreditCards],
  );

  return {
    supabaseMonthlyBalances,
    selectedBalanceMonth,
    setSelectedBalanceMonth,
    monthlyBalancesLoading,
    monthlyBalancesSaving,
    monthlyBalancesError,
    loadSupabaseMonthlyBalances,
    saveSupabaseMonthlyBalance,
  };
}
