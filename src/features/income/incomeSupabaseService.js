import { supabase } from "../../lib/supabase/client.js";
import { normalizeIncomeEntryForm, normalizeIncomeSourceForm } from "./incomeService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppIncomeSource(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    name: row.name,
    sourceType: row.source_type,
    ownerProfileId: row.owner_profile_id,
    expectedAmount: Number(row.expected_amount || 0),
    frequency: row.frequency,
    isActive: Boolean(row.is_active),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAppIncomeEntry(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    incomeSourceId: row.income_source_id,
    ownerProfileId: row.owner_profile_id,
    entryDate: row.entry_date,
    monthKey: row.month_key,
    amount: Number(row.amount || 0),
    entryType: row.entry_type,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbIncomeSource(input) {
  const normalized = normalizeIncomeSourceForm(input);
  return {
    name: normalized.name,
    source_type: normalized.sourceType,
    owner_profile_id: normalized.ownerProfileId,
    expected_amount: normalized.expectedAmount,
    frequency: normalized.frequency,
    is_active: normalized.isActive,
    notes: normalized.notes,
  };
}

function toDbIncomeEntry(input) {
  const normalized = normalizeIncomeEntryForm(input);
  return {
    income_source_id: normalized.incomeSourceId,
    owner_profile_id: normalized.ownerProfileId,
    entry_date: normalized.entryDate,
    month_key: normalized.monthKey,
    amount: normalized.amount,
    entry_type: normalized.entryType,
    notes: normalized.notes,
  };
}

export async function listIncomeSources(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_sources")
    .select("*")
    .eq("household_id", householdId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppIncomeSource);
}

export async function createIncomeSource(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding an income source.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_sources")
    .insert({ household_id: householdId, ...toDbIncomeSource(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppIncomeSource(data);
}

export async function updateIncomeSource(sourceId, payload) {
  if (!sourceId) {
    throw new Error("Income source id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_sources")
    .update(toDbIncomeSource(payload))
    .eq("id", sourceId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppIncomeSource(data);
}

export async function deleteIncomeSource(sourceId) {
  if (!sourceId) {
    throw new Error("Income source id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("income_sources").delete().eq("id", sourceId);
  if (error) throw error;
}

export async function listIncomeEntries(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_entries")
    .select("*")
    .eq("household_id", householdId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAppIncomeEntry);
}

export async function createIncomeEntry(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding an income entry.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_entries")
    .insert({ household_id: householdId, ...toDbIncomeEntry(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppIncomeEntry(data);
}

export async function updateIncomeEntry(entryId, payload) {
  if (!entryId) {
    throw new Error("Income entry id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("income_entries")
    .update(toDbIncomeEntry(payload))
    .eq("id", entryId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppIncomeEntry(data);
}

export async function deleteIncomeEntry(entryId) {
  if (!entryId) {
    throw new Error("Income entry id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("income_entries").delete().eq("id", entryId);
  if (error) throw error;
}
