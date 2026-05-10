import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function normalizeCardInput(input) {
  return {
    name: input.name.trim(),
    url: input.url.trim(),
    network: input.network,
    owner_name: input.owner,
    owner_profile_id: input.ownerProfileId || null,
    last_four: input.lastFour.trim(),
    credit_limit: Number(input.creditLimit) || 0,
    statement_closing_day: Number(input.statementClosingDay) || Number(input.dueDay) || 1,
    due_day: Number(input.dueDay) || 1,
    is_active: input.isActive ?? true,
  };
}

function toAppCreditCard(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    name: row.name,
    url: row.url,
    network: row.network,
    owner: row.household_profiles?.display_name ?? row.owner_name,
    ownerProfileId: row.owner_profile_id,
    lastFour: row.last_four,
    creditLimit: Number(row.credit_limit || 0),
    statementClosingDay: row.statement_closing_day,
    dueDay: row.due_day,
    isActive: row.is_active,
    importedLocalId: row.imported_local_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCreditCards(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("credit_cards")
    .select("*, household_profiles (display_name)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppCreditCard);
}

export async function addCreditCardToSupabase(householdId, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("credit_cards")
    .insert({
      household_id: householdId,
      ...normalizeCardInput(input),
    })
    .select("*, household_profiles (display_name)")
    .single();

  if (error) throw error;
  return toAppCreditCard(data);
}

export async function updateCreditCardInSupabase(cardId, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("credit_cards")
    .update(normalizeCardInput(input))
    .eq("id", cardId)
    .select("*, household_profiles (display_name)")
    .single();

  if (error) throw error;
  return toAppCreditCard(data);
}

export async function deleteCreditCardFromSupabase(cardId) {
  const client = requireSupabase();
  const { error } = await client.from("credit_cards").delete().eq("id", cardId);

  if (error) throw error;
}

export async function importLocalCreditCards(householdId, localCards) {
  if (!householdId || localCards.length === 0) return [];

  const client = requireSupabase();
  const rows = localCards.map((card) => ({
    household_id: householdId,
    imported_local_id: card.id,
    name: card.name,
    url: card.url,
    network: card.network,
    owner_name: card.owner,
    last_four: card.lastFour,
    credit_limit: Number(card.creditLimit) || 0,
    statement_closing_day: Number(card.statementClosingDay) || Number(card.dueDay) || 1,
    due_day: Number(card.dueDay) || 1,
    is_active: card.isActive ?? true,
    created_at: card.createdAt ?? undefined,
    updated_at: card.updatedAt ?? undefined,
  }));

  const { data, error } = await client
    .from("credit_cards")
    .upsert(rows, {
      onConflict: "household_id,imported_local_id",
      ignoreDuplicates: true,
    })
    .select("*, household_profiles (display_name)");

  if (error) throw error;
  return (data ?? []).map(toAppCreditCard);
}
