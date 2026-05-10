import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function normalizeBudgetInput(input) {
  return {
    name: input.name.trim(),
    monthly_amount: Number(input.monthlyAmount) || 0,
    notes: input.notes?.trim() ?? "",
  };
}

function toAppBudget(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    name: row.name,
    monthlyAmount: Number(row.monthly_amount || 0),
    notes: row.notes ?? "",
    importedLocalId: row.imported_local_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listBudgetCategories(householdId, monthKey) {
  if (!householdId || !monthKey) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("budget_categories")
    .select("*")
    .eq("household_id", householdId)
    .eq("month_key", monthKey)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppBudget);
}

export async function addBudgetCategoryToSupabase(householdId, monthKey, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("budget_categories")
    .insert({
      household_id: householdId,
      month_key: monthKey,
      ...normalizeBudgetInput(input),
    })
    .select("*")
    .single();

  if (error) throw error;
  return toAppBudget(data);
}

export async function updateBudgetCategoryInSupabase(budgetId, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("budget_categories")
    .update(normalizeBudgetInput(input))
    .eq("id", budgetId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppBudget(data);
}

export async function deleteBudgetCategoryFromSupabase(budgetId) {
  const client = requireSupabase();
  const { error } = await client.from("budget_categories").delete().eq("id", budgetId);

  if (error) throw error;
}

export async function importLocalBudgetCategories(householdId, localBudgetsByMonth) {
  if (!householdId || !localBudgetsByMonth) return [];

  const rows = Object.entries(localBudgetsByMonth).flatMap(([monthKey, budgets]) =>
    (budgets ?? []).map((budget) => ({
      household_id: householdId,
      month_key: monthKey,
      imported_local_id: budget.id,
      name: budget.name,
      monthly_amount: Number(budget.monthlyAmount) || 0,
      notes: budget.notes ?? "",
      created_at: budget.createdAt ?? undefined,
      updated_at: budget.updatedAt ?? undefined,
    })),
  );

  if (rows.length === 0) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("budget_categories")
    .upsert(rows, {
      onConflict: "household_id,imported_local_id",
      ignoreDuplicates: true,
    })
    .select("*");

  if (error) throw error;
  return (data ?? []).map(toAppBudget);
}
