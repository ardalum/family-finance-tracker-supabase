import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function normalizeProfileInput(input) {
  return {
    display_name: input.displayName.trim(),
    role_label: input.roleLabel?.trim() || null,
    is_active: input.isActive ?? true,
  };
}

function toAppProfile(row) {
  return {
    id: row.id,
    householdId: row.household_id,
    displayName: row.display_name,
    roleLabel: row.role_label ?? "",
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listHouseholdProfiles(householdId) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("household_profiles")
    .select("*")
    .eq("household_id", householdId)
    .order("display_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toAppProfile);
}

export async function addHouseholdProfile(householdId, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("household_profiles")
    .insert({
      household_id: householdId,
      ...normalizeProfileInput(input),
    })
    .select("*")
    .single();

  if (error) throw error;
  return toAppProfile(data);
}

export async function updateHouseholdProfile(profileId, input) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("household_profiles")
    .update(normalizeProfileInput(input))
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppProfile(data);
}

export async function deactivateHouseholdProfile(profileId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("household_profiles")
    .update({ is_active: false })
    .eq("id", profileId)
    .select("*")
    .single();

  if (error) throw error;
  return toAppProfile(data);
}

export async function createDefaultHouseholdProfiles(
  householdId,
  existingProfiles = [],
  defaultNames = [],
) {
  const client = requireSupabase();
  const existingNames = new Set(
    existingProfiles.map((profile) => profile.displayName.trim().toLowerCase()),
  );
  const uniqueDefaultNames = [...new Set(defaultNames.map((name) => name.trim()).filter(Boolean))];
  const rows = uniqueDefaultNames
    .filter((displayName) => !existingNames.has(displayName.toLowerCase()))
    .map((displayName) => ({
      household_id: householdId,
      display_name: displayName,
      role_label: null,
      is_active: true,
    }));

  if (rows.length === 0) return [];

  const { data, error } = await client.from("household_profiles").insert(rows).select("*");

  if (error) throw error;
  return (data ?? []).map(toAppProfile);
}
