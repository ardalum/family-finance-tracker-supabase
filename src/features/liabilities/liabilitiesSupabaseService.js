import { supabase } from "../../lib/supabase/client.js";
import {
  normalizeLiabilityAccountForm,
  normalizeLiabilitySnapshotForm,
} from "./liabilitiesService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppLiabilityAccount(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    name: row.name,
    liabilityType: row.liability_type,
    ownerProfileId: row.owner_profile_id,
    linkedCreditCardId: row.linked_credit_card_id,
    institutionName: row.institution_name ?? "",
    interestRate:
      row.interest_rate === null || row.interest_rate === undefined
        ? null
        : Number(row.interest_rate),
    minimumPayment: Number(row.minimum_payment || 0),
    dueDay: row.due_day ?? null,
    isActive: Boolean(row.is_active),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAppLiabilitySnapshot(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    liabilityAccountId: row.liability_account_id,
    ownerProfileId: row.owner_profile_id,
    snapshotDate: row.snapshot_date,
    monthKey: row.month_key,
    balanceAmount: Number(row.balance_amount || 0),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbLiabilityAccount(input) {
  const normalized = normalizeLiabilityAccountForm(input);
  return {
    name: normalized.name,
    liability_type: normalized.liabilityType,
    owner_profile_id: normalized.ownerProfileId,
    linked_credit_card_id: normalized.linkedCreditCardId,
    institution_name: normalized.institutionName,
    interest_rate: normalized.interestRate,
    minimum_payment: normalized.minimumPayment,
    due_day: normalized.dueDay,
    is_active: normalized.isActive,
    notes: normalized.notes,
  };
}

function toDbLiabilitySnapshot(input) {
  const normalized = normalizeLiabilitySnapshotForm(input);
  return {
    liability_account_id: normalized.liabilityAccountId,
    owner_profile_id: normalized.ownerProfileId,
    snapshot_date: normalized.snapshotDate,
    month_key: normalized.monthKey,
    balance_amount: normalized.balanceAmount,
    notes: normalized.notes,
  };
}

export async function listLiabilityAccounts(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_accounts")
    .select("*")
    .eq("household_id", householdId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppLiabilityAccount);
}

export async function createLiabilityAccount(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a liability account.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_accounts")
    .insert({ household_id: householdId, ...toDbLiabilityAccount(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppLiabilityAccount(data);
}

export async function updateLiabilityAccount(accountId, payload) {
  if (!accountId) {
    throw new Error("Liability account id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_accounts")
    .update(toDbLiabilityAccount(payload))
    .eq("id", accountId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppLiabilityAccount(data);
}

export async function deleteLiabilityAccount(accountId) {
  if (!accountId) {
    throw new Error("Liability account id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("liability_accounts").delete().eq("id", accountId);
  if (error) throw error;
}

export async function listLiabilityBalanceSnapshots(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_balance_snapshots")
    .select("*")
    .eq("household_id", householdId)
    .order("snapshot_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAppLiabilitySnapshot);
}

export async function createLiabilityBalanceSnapshot(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a liability balance snapshot.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_balance_snapshots")
    .insert({ household_id: householdId, ...toDbLiabilitySnapshot(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppLiabilitySnapshot(data);
}

export async function updateLiabilityBalanceSnapshot(snapshotId, payload) {
  if (!snapshotId) {
    throw new Error("Liability balance snapshot id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("liability_balance_snapshots")
    .update(toDbLiabilitySnapshot(payload))
    .eq("id", snapshotId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppLiabilitySnapshot(data);
}

export async function deleteLiabilityBalanceSnapshot(snapshotId) {
  if (!snapshotId) {
    throw new Error("Liability balance snapshot id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("liability_balance_snapshots").delete().eq("id", snapshotId);
  if (error) throw error;
}
