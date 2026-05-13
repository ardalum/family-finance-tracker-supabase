import { supabase } from "../../lib/supabase/client.js";

const HOUSEHOLD_FINANCE_DELETE_PHRASE = "DELETE FINANCE DATA";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export function getHouseholdFinanceDeletePhrase() {
  return HOUSEHOLD_FINANCE_DELETE_PHRASE;
}

export async function deleteHouseholdFinanceDataSecurely(householdId, confirmation) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before deleting household finance data.",
    };
  }

  if (confirmation !== HOUSEHOLD_FINANCE_DELETE_PHRASE) {
    return {
      ok: false,
      message: `Type ${HOUSEHOLD_FINANCE_DELETE_PHRASE} to confirm household finance data deletion.`,
    };
  }

  try {
    const client = requireSupabase();
    const { data, error } = await client.functions.invoke("delete-household-finance-data", {
      body: {
        householdId,
        confirmation,
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return {
      ok: true,
      message: "Household finance data deleted securely. You have been signed out.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not delete household finance data.",
    };
  }
}
