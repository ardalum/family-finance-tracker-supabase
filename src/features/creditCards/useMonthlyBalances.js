import { useCallback, useEffect, useState } from "react";
import {
  deleteMonthlyBalance,
  listAllMonthlyBalances,
  upsertMonthlyBalance,
} from "./monthlyBalancesSupabaseService.js";

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

      setMonthlyBalancesError("");
      setSupabaseMonthlyBalances((balances) => {
        const monthEntries = { ...(balances[monthKey] ?? {}) };

        if (!entry) {
          delete monthEntries[cardId];
        } else {
          monthEntries[cardId] = {
            balance: Number(entry.balance ?? 0) || 0,
            paid: Boolean(entry.paid),
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
        if (!entry) {
          await deleteMonthlyBalance(activeHouseholdId, monthKey, card);
        } else {
          await upsertMonthlyBalance(activeHouseholdId, monthKey, card, entry);
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
