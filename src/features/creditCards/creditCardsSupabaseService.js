import { supabase } from "../../lib/supabase/client.js";
import { toSupabaseCardFormInput } from "./cardFormUtils.js";
function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppCreditCard(row) {
  return {
    id: row.id,
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
    autopayEnabled: Boolean(row.autopay_enabled),
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
      ...toSupabaseCardFormInput(input),
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
    .update(toSupabaseCardFormInput(input))
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
