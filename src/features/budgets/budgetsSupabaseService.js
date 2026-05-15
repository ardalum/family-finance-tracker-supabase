import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
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
    categoryModelId: row.category_model_id,
    monthlyBudgetId: row.monthly_budget_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toLegacyBudgetRow(monthBudget, category) {
  return {
    id: monthBudget.legacy_budget_category_id ?? monthBudget.id,
    imported_local_id: monthBudget.imported_local_id,
    category_model_id: category.id,
    monthly_budget_id: monthBudget.id,
    name: category.name,
    monthly_amount: monthBudget.budgeted_amount,
    notes: monthBudget.notes,
    created_at: monthBudget.created_at,
    updated_at: monthBudget.updated_at,
  };
}

async function findCategoryByName(client, householdId, name) {
  const cleanName = name.trim().toLowerCase();
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("household_id", householdId)
    .eq("type", "expense")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).find((category) => category.name.trim().toLowerCase() === cleanName) ?? null;
}

async function ensureCategory(client, householdId, input) {
  const normalized = normalizeBudgetInput(input);
  const existing = await findCategoryByName(client, householdId, normalized.name);
  if (existing) {
    if (!existing.is_active) {
      const { data, error } = await client
        .from("categories")
        .update({ is_active: true })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    }

    return existing;
  }

  const { data, error } = await client
    .from("categories")
    .insert({
      household_id: householdId,
      name: normalized.name,
      type: "expense",
      is_active: true,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function upsertMonthlyBudget(
  client,
  householdId,
  monthKey,
  categoryId,
  input,
  importedLocalId = null,
) {
  const normalized = normalizeBudgetInput(input);
  const { data, error } = await client
    .from("monthly_category_budgets")
    .upsert(
      {
        household_id: householdId,
        category_id: categoryId,
        month_key: monthKey,
        budgeted_amount: normalized.monthly_amount,
        notes: normalized.notes,
        imported_local_id: importedLocalId,
      },
      { onConflict: "category_id,month_key" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

async function syncCategoryModelForLegacyBudget(client, legacyBudgetRow, input) {
  const normalized = normalizeBudgetInput(input);
  const category = await ensureCategory(client, legacyBudgetRow.household_id, normalized);
  const monthlyBudget = await upsertMonthlyBudget(
    client,
    legacyBudgetRow.household_id,
    legacyBudgetRow.month_key,
    category.id,
    normalized,
    legacyBudgetRow.imported_local_id,
  );

  return { category, monthlyBudget };
}

export async function listBudgetCategories(householdId, monthKey) {
  if (!householdId || !monthKey) return [];

  const client = requireSupabase();
  const { data: legacyRows, error: legacyError } = await client
    .from("budget_categories")
    .select("*")
    .eq("household_id", householdId)
    .eq("month_key", monthKey)
    .order("created_at", { ascending: true });

  if (legacyError) throw legacyError;

  // The app still uses legacy budget_categories IDs for transactions and recurring payments.
  // New model tables are kept in sync on create/update/import, then the legacy table can be retired later.
  if ((legacyRows ?? []).length > 0) return legacyRows.map(toAppBudget);

  const { data: monthlyBudgets, error: monthlyError } = await client
    .from("monthly_category_budgets")
    .select("*, categories (*)")
    .eq("household_id", householdId)
    .eq("month_key", monthKey)
    .order("created_at", { ascending: true });

  if (monthlyError) throw monthlyError;

  return (monthlyBudgets ?? []).map((monthBudget) =>
    toAppBudget(toLegacyBudgetRow(monthBudget, monthBudget.categories)),
  );
}

export async function addBudgetCategoryToSupabase(householdId, monthKey, input) {
  const client = requireSupabase();
  const normalized = normalizeBudgetInput(input);
  const category = await ensureCategory(client, householdId, normalized);
  const monthlyBudget = await upsertMonthlyBudget(
    client,
    householdId,
    monthKey,
    category.id,
    normalized,
  );

  const { data, error } = await client
    .from("budget_categories")
    .insert({
      household_id: householdId,
      month_key: monthKey,
      ...normalized,
    })
    .select("*")
    .single();

  if (error) throw error;

  return toAppBudget({
    ...data,
    category_model_id: category.id,
    monthly_budget_id: monthlyBudget.id,
  });
}

export async function updateBudgetCategoryInSupabase(budgetId, input) {
  const client = requireSupabase();
  const normalized = normalizeBudgetInput(input);

  const { data: existingBudget, error: existingError } = await client
    .from("budget_categories")
    .select("*")
    .eq("id", budgetId)
    .single();

  if (existingError) throw existingError;

  const category = await ensureCategory(client, existingBudget.household_id, normalized);
  const monthlyBudget = await upsertMonthlyBudget(
    client,
    existingBudget.household_id,
    existingBudget.month_key,
    category.id,
    normalized,
    existingBudget.imported_local_id,
  );

  const { data, error } = await client
    .from("budget_categories")
    .update(normalized)
    .eq("id", budgetId)
    .select("*")
    .single();

  if (error) throw error;

  return toAppBudget({
    ...data,
    category_model_id: category.id,
    monthly_budget_id: monthlyBudget.id,
  });
}

export async function deleteBudgetCategoryFromSupabase(budgetId) {
  const client = requireSupabase();
  const { data: existingBudget, error: existingError } = await client
    .from("budget_categories")
    .select("*")
    .eq("id", budgetId)
    .single();

  if (existingError) throw existingError;

  const category = await findCategoryByName(
    client,
    existingBudget.household_id,
    existingBudget.name,
  );
  if (category) {
    const { error: monthlyDeleteError } = await client
      .from("monthly_category_budgets")
      .delete()
      .eq("category_id", category.id)
      .eq("month_key", existingBudget.month_key);

    if (monthlyDeleteError) throw monthlyDeleteError;
  }

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
  for (const row of rows) {
    const input = {
      name: row.name,
      monthlyAmount: row.monthly_amount,
      notes: row.notes,
    };
    const category = await ensureCategory(client, householdId, input);
    await upsertMonthlyBudget(
      client,
      householdId,
      row.month_key,
      category.id,
      input,
      row.imported_local_id,
    );
  }

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
