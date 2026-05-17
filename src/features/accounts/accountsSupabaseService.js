import { supabase } from "../../lib/supabase/client.js";
import {
  normalizeAccountBalanceSnapshotForm,
  normalizeCashAccountForm,
} from "./accountsService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppCashAccount(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    name: row.name,
    accountType: row.account_type,
    ownerProfileId: row.owner_profile_id,
    institutionName: row.institution_name ?? "",
    isActive: Boolean(row.is_active),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAppAccountBalanceSnapshot(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    cashAccountId: row.cash_account_id,
    ownerProfileId: row.owner_profile_id,
    snapshotDate: row.snapshot_date,
    monthKey: row.month_key,
    balanceAmount: Number(row.balance_amount || 0),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbCashAccount(input) {
  const normalized = normalizeCashAccountForm(input);
  return {
    name: normalized.name,
    account_type: normalized.accountType,
    owner_profile_id: normalized.ownerProfileId,
    institution_name: normalized.institutionName,
    is_active: normalized.isActive,
    notes: normalized.notes,
  };
}

function toDbAccountBalanceSnapshot(input) {
  const normalized = normalizeAccountBalanceSnapshotForm(input);
  return {
    cash_account_id: normalized.cashAccountId,
    owner_profile_id: normalized.ownerProfileId,
    snapshot_date: normalized.snapshotDate,
    month_key: normalized.monthKey,
    balance_amount: normalized.balanceAmount,
    notes: normalized.notes,
  };
}

export async function listCashAccounts(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("cash_accounts")
    .select("*")
    .eq("household_id", householdId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppCashAccount);
}

export async function createCashAccount(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a cash account.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("cash_accounts")
    .insert({ household_id: householdId, ...toDbCashAccount(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppCashAccount(data);
}

export async function updateCashAccount(accountId, payload) {
  if (!accountId) {
    throw new Error("Cash account id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("cash_accounts")
    .update(toDbCashAccount(payload))
    .eq("id", accountId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppCashAccount(data);
}

export async function deleteCashAccount(accountId) {
  if (!accountId) {
    throw new Error("Cash account id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("cash_accounts").delete().eq("id", accountId);
  if (error) throw error;
}

export async function listAccountBalanceSnapshots(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_balance_snapshots")
    .select("*")
    .eq("household_id", householdId)
    .order("snapshot_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAppAccountBalanceSnapshot);
}

export async function createAccountBalanceSnapshot(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding an account balance snapshot.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_balance_snapshots")
    .insert({ household_id: householdId, ...toDbAccountBalanceSnapshot(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppAccountBalanceSnapshot(data);
}

export async function updateAccountBalanceSnapshot(snapshotId, payload) {
  if (!snapshotId) {
    throw new Error("Account balance snapshot id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("account_balance_snapshots")
    .update(toDbAccountBalanceSnapshot(payload))
    .eq("id", snapshotId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppAccountBalanceSnapshot(data);
}

export async function deleteAccountBalanceSnapshot(snapshotId) {
  if (!snapshotId) {
    throw new Error("Account balance snapshot id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("account_balance_snapshots").delete().eq("id", snapshotId);
  if (error) throw error;
}
