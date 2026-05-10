import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function householdHasFinanceData(householdId) {
  if (!householdId) return false;

  const client = requireSupabase();
  const tables = [
    "household_profiles",
    "credit_cards",
    "monthly_card_balances",
    "budget_categories",
    "transactions",
    "transaction_splits",
    "recurring_payments",
    "recurring_payment_instances",
  ];

  const results = await Promise.all(
    tables.map((table) =>
      client
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("household_id", householdId),
    ),
  );

  const error = results.find((result) => result.error)?.error;
  if (error) throw error;

  return results.some((result) => Number(result.count || 0) > 0);
}
