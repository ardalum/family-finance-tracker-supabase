import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function getSupabaseCardId(card) {
  return card?.supabaseId ?? card?.id;
}

function toMonthBalanceEntry(row, cardsBySupabaseId) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const cardId = card?.id ?? row.credit_card_id;

  return [
    cardId,
    {
      balance: Number(row.balance || 0),
      paid: Boolean(row.paid),
      updatedAt: row.updated_at,
    },
  ];
}

export async function listMonthlyBalances(householdId, monthKey, cards) {
  if (!householdId || !monthKey) return {};

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_card_balances")
    .select("*")
    .eq("household_id", householdId)
    .eq("month_key", monthKey);

  if (error) throw error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  return Object.fromEntries(
    (data ?? []).map((row) => toMonthBalanceEntry(row, cardsBySupabaseId)),
  );
}

export async function listAllMonthlyBalances(householdId, cards) {
  if (!householdId) return {};

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_card_balances")
    .select("*")
    .eq("household_id", householdId);

  if (error) throw error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  return (data ?? []).reduce((result, row) => {
    const [cardId, entry] = toMonthBalanceEntry(row, cardsBySupabaseId);
    return {
      ...result,
      [row.month_key]: {
        ...(result[row.month_key] ?? {}),
        [cardId]: entry,
      },
    };
  }, {});
}

export async function upsertMonthlyBalance(householdId, monthKey, card, patch) {
  const client = requireSupabase();
  const creditCardId = getSupabaseCardId(card);

  const { data, error } = await client
    .from("monthly_card_balances")
    .upsert(
      {
        household_id: householdId,
        credit_card_id: creditCardId,
        month_key: monthKey,
        balance: Number(patch.balance ?? 0) || 0,
        paid: Boolean(patch.paid),
      },
      { onConflict: "credit_card_id,month_key" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function importLocalMonthlyBalances(householdId, localMonthlyBalances, cards) {
  if (!householdId || !localMonthlyBalances || cards.length === 0) return [];

  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const rows = [];

  Object.entries(localMonthlyBalances).forEach(([monthKey, balances]) => {
    Object.entries(balances ?? {}).forEach(([cardId, entry]) => {
      const card = cardsByAppId.get(cardId);
      if (!card) return;

      rows.push({
        household_id: householdId,
        credit_card_id: getSupabaseCardId(card),
        month_key: monthKey,
        balance: Number(entry?.balance || 0),
        paid: Boolean(entry?.paid),
      });
    });
  });

  if (rows.length === 0) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_card_balances")
    .upsert(rows, {
      onConflict: "credit_card_id,month_key",
      ignoreDuplicates: true,
    })
    .select("*");

  if (error) throw error;
  return data ?? [];
}
