import { supabase } from "../../lib/supabase/client.js";

const ACTIVE_HOUSEHOLD_KEY = "personalFinanceApp:activeHouseholdByUser:v1";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function readActiveHouseholdMap() {
  try {
    return JSON.parse(window.localStorage.getItem(ACTIVE_HOUSEHOLD_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getStoredActiveHouseholdId(userId) {
  if (!userId) return null;
  const activeHouseholds = readActiveHouseholdMap();
  return activeHouseholds[userId] || null;
}

export function storeActiveHouseholdId(userId, householdId) {
  if (!userId || !householdId) return;

  const activeHouseholds = readActiveHouseholdMap();
  window.localStorage.setItem(
    ACTIVE_HOUSEHOLD_KEY,
    JSON.stringify({
      ...activeHouseholds,
      [userId]: householdId,
    }),
  );
}

export function clearStoredActiveHouseholdId(userId) {
  if (!userId) return;

  const activeHouseholds = readActiveHouseholdMap();
  delete activeHouseholds[userId];
  window.localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, JSON.stringify(activeHouseholds));
}

export async function listUserHouseholds() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("household_members")
    .select(
      `
        id,
        role,
        status,
        household_id,
        households (
          id,
          name,
          created_at,
          updated_at
        )
      `,
    )
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? [])
    .filter((membership) => membership.households)
    .map((membership) => ({
      membershipId: membership.id,
      householdId: membership.household_id,
      role: membership.role,
      status: membership.status,
      household: membership.households,
    }));
}

export async function createFirstHousehold(name) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("create_first_household_for_current_user", {
    household_name: name,
  });

  if (error) throw error;
  return data;
}

export async function createHousehold(name) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("create_household_for_current_user", {
    household_name: name,
  });

  if (error) throw error;
  return data;
}
