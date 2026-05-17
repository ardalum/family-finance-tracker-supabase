import { supabase } from "../../lib/supabase/client.js";
import { normalizeSavingsContributionForm, normalizeSavingsGoalForm } from "./savingsService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function toAppSavingsGoal(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    name: row.name,
    goalType: row.goal_type,
    targetAmount: Number(row.target_amount || 0),
    startingAmount: Number(row.starting_amount || 0),
    targetDate: row.target_date,
    ownerProfileId: row.owner_profile_id,
    isActive: Boolean(row.is_active),
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toAppSavingsContribution(row) {
  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    householdId: row.household_id,
    savingsGoalId: row.savings_goal_id,
    ownerProfileId: row.owner_profile_id,
    contributionDate: row.contribution_date,
    monthKey: row.month_key,
    amount: Number(row.amount || 0),
    contributionType: row.contribution_type,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDbSavingsGoal(input) {
  const normalized = normalizeSavingsGoalForm(input);
  return {
    name: normalized.name,
    goal_type: normalized.goalType,
    target_amount: normalized.targetAmount,
    starting_amount: normalized.startingAmount,
    target_date: normalized.targetDate,
    owner_profile_id: normalized.ownerProfileId,
    is_active: normalized.isActive,
    notes: normalized.notes,
  };
}

function toDbSavingsContribution(input) {
  const normalized = normalizeSavingsContributionForm(input);
  return {
    savings_goal_id: normalized.savingsGoalId,
    owner_profile_id: normalized.ownerProfileId,
    contribution_date: normalized.contributionDate,
    month_key: normalized.monthKey,
    amount: normalized.amount,
    contribution_type: normalized.contributionType,
    notes: normalized.notes,
  };
}

export async function listSavingsGoals(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_goals")
    .select("*")
    .eq("household_id", householdId)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppSavingsGoal);
}

export async function createSavingsGoal(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a savings goal.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_goals")
    .insert({ household_id: householdId, ...toDbSavingsGoal(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppSavingsGoal(data);
}

export async function updateSavingsGoal(goalId, payload) {
  if (!goalId) {
    throw new Error("Savings goal id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_goals")
    .update(toDbSavingsGoal(payload))
    .eq("id", goalId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppSavingsGoal(data);
}

export async function deleteSavingsGoal(goalId) {
  if (!goalId) {
    throw new Error("Savings goal id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("savings_goals").delete().eq("id", goalId);
  if (error) throw error;
}

export async function listSavingsContributions(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_contributions")
    .select("*")
    .eq("household_id", householdId)
    .order("contribution_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(toAppSavingsContribution);
}

export async function createSavingsContribution(householdId, payload) {
  if (!householdId) {
    throw new Error("Choose an active household before adding a savings contribution.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_contributions")
    .insert({ household_id: householdId, ...toDbSavingsContribution(payload) })
    .select("*")
    .single();

  if (error) throw error;
  return toAppSavingsContribution(data);
}

export async function updateSavingsContribution(contributionId, payload) {
  if (!contributionId) {
    throw new Error("Savings contribution id is required.");
  }

  const client = requireSupabase();
  const { data, error } = await client
    .from("savings_contributions")
    .update(toDbSavingsContribution(payload))
    .eq("id", contributionId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppSavingsContribution(data);
}

export async function deleteSavingsContribution(contributionId) {
  if (!contributionId) {
    throw new Error("Savings contribution id is required.");
  }

  const client = requireSupabase();
  const { error } = await client.from("savings_contributions").delete().eq("id", contributionId);
  if (error) throw error;
}
