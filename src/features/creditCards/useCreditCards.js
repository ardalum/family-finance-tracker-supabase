import { useCallback, useEffect, useState } from "react";
import {
  addCreditCardToSupabase,
  deleteCreditCardFromSupabase,
  listCreditCards,
  updateCreditCardInSupabase,
} from "./creditCardsSupabaseService.js";

export function useCreditCards({ activeHouseholdId }) {
  const [supabaseCreditCards, setSupabaseCreditCards] = useState([]);
  const [creditCardsLoading, setCreditCardsLoading] = useState(true);
  const [creditCardsSaving, setCreditCardsSaving] = useState(false);
  const [creditCardsError, setCreditCardsError] = useState("");

  const loadSupabaseCreditCards = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseCreditCards([]);
      setCreditCardsLoading(false);
      return [];
    }

    setCreditCardsLoading(true);
    setCreditCardsError("");

    try {
      const cards = await listCreditCards(activeHouseholdId);
      setSupabaseCreditCards(cards);
      return cards;
    } catch (error) {
      setCreditCardsError(error.message || "Could not load credit cards.");
      setSupabaseCreditCards([]);
      return [];
    } finally {
      setCreditCardsLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadSupabaseCreditCards();
  }, [loadSupabaseCreditCards]);

  const createSupabaseCreditCard = useCallback(
    async (input) => {
      setCreditCardsSaving(true);
      setCreditCardsError("");

      try {
        const card = await addCreditCardToSupabase(activeHouseholdId, input);
        setSupabaseCreditCards((cards) => [...cards, card]);
        return card;
      } catch (error) {
        setCreditCardsError(error.message || "Could not add credit card.");
        throw error;
      } finally {
        setCreditCardsSaving(false);
      }
    },
    [activeHouseholdId],
  );

  const updateSupabaseCreditCard = useCallback(async (cardId, input) => {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      const card = await updateCreditCardInSupabase(cardId, input);
      setSupabaseCreditCards((cards) =>
        cards.map((currentCard) => (currentCard.id === card.id ? card : currentCard)),
      );
      return card;
    } catch (error) {
      setCreditCardsError(error.message || "Could not update credit card.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }, []);

  const deleteSupabaseCreditCard = useCallback(async (cardId) => {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      await deleteCreditCardFromSupabase(cardId);
      setSupabaseCreditCards((cards) => cards.filter((card) => card.id !== cardId));
    } catch (error) {
      setCreditCardsError(error.message || "Could not delete credit card.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }, []);

  return {
    supabaseCreditCards,
    creditCardsLoading,
    creditCardsSaving,
    creditCardsError,
    loadSupabaseCreditCards,
    createSupabaseCreditCard,
    updateSupabaseCreditCard,
    deleteSupabaseCreditCard,
  };
}
