import { supabase } from "../../lib/supabase/client.js";
import { normalizeMoneyMovementForm } from "./accountMoneyMovementsService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppMoneyMovement(row) {
  return {
    id: row.id,
    householdId: row.household_id,
    accountId: row.account_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    movementType: row.movement_type,
    direction: row.direction,
    amount: Number(row.amount || 0),
    movementDate: row.movement_date,
    monthKey: row.month_key,
    description: row.description ?? "",
    isTracked: Boolean(row.is_tracked),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbMoneyMovement(input) {
  const normalized = normalizeMoneyMovementForm(input);
  return {
    account_id: normalized.accountId,
    source_type: normalized.sourceType,
    source_id: normalized.sourceId,
    movement_type: normalized.movementType,
    direction: normalized.direction,
    amount: normalized.amount,
    movement_date: normalized.movementDate,
    month_key: normalized.monthKey,
    description: normalized.description,
    is_tracked: normalized.isTracked,
  };
}

export async function listAccountMoneyMovements(householdId, { monthKey } = {}) {
  if (!householdId) return [];

  const client = requireSupabase();
  let query = client
    .from("account_money_movements")
    .select("*")
    .eq("household_id", householdId)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (monthKey) {
    query = query.eq("month_key", monthKey);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map(toAppMoneyMovement);
}

export async function createAccountMoneyMovement(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a money movement.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_money_movements")
    .insert({ household_id: householdId, ...toDbMoneyMovement({ ...payload, householdId }) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppMoneyMovement(data);
}

export async function updateAccountMoneyMovement(movementId, payload) {
  if (!movementId) {
    throw new Error("Money movement id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_money_movements")
    .update(toDbMoneyMovement(payload))
    .eq("id", movementId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppMoneyMovement(data);
}

export async function deleteAccountMoneyMovement(movementId) {
  if (!movementId) {
    throw new Error("Money movement id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("account_money_movements").delete().eq("id", movementId);
  if (error) throw error;
}

export async function findAccountMoneyMovementBySource(householdId, sourceType, sourceId) {
  if (!householdId || !sourceType || !sourceId) return null;

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_money_movements")
    .select("*")
    .eq("household_id", householdId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId)
    .maybeSingle();

  if (error) throw error;
  return data ? toAppMoneyMovement(data) : null;
}

export async function replaceAccountMoneyMovementBySource(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before saving a money movement.");
  }

  const normalized = normalizeMoneyMovementForm({ ...payload, householdId });
  if (!normalized.sourceId) {
    return createAccountMoneyMovement(householdId, normalized);
  }

  const client = requireSupabase();
  const dbPayload = {
    household_id: householdId,
    ...toDbMoneyMovement(normalized),
  };

  const { data, error } = await client
    .from("account_money_movements")
    .upsert(dbPayload, {
      onConflict: "household_id,source_type,source_id",
    })
    .select("*")
    .single();

  if (error) throw error;
  return toAppMoneyMovement(data);
}

export async function deleteAccountMoneyMovementBySource(householdId, sourceType, sourceId) {
  if (!householdId || !sourceType || !sourceId) return;

  const client = requireSupabase();
  const { error } = await client
    .from("account_money_movements")
    .delete()
    .eq("household_id", householdId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId);

  if (error) throw error;
}
