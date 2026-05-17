import { supabase } from "../../lib/supabase/client.js";
import {
  buildReopenUpdate,
  buildReviewedUpdate,
  mergeManualChecks,
  normalizeMonthlyCloseReviewRow,
} from "./monthlyCloseReviewUtils.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function mapReviewUpdateToRow(updates = {}) {
  const row = {};
  if (updates.status) row.status = updates.status;
  if (updates.notes !== undefined) row.notes = updates.notes ?? "";
  if (updates.manualChecks !== undefined) row.manual_checks = updates.manualChecks ?? {};
  if (updates.reviewedAt !== undefined) row.reviewed_at = updates.reviewedAt;
  if (updates.reviewedBy !== undefined) row.reviewed_by = updates.reviewedBy;
  return row;
}

async function getCurrentUserId(client) {
  const {
    data: { user },
  } = await client.auth.getUser();
  return user?.id ?? null;
}

export async function getMonthlyCloseReview(householdId, monthKey) {
  if (!householdId || !monthKey) return normalizeMonthlyCloseReviewRow(null, householdId, monthKey);

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_close_reviews")
    .select("*")
    .eq("household_id", householdId)
    .eq("month_key", monthKey)
    .maybeSingle();

  if (error) throw error;
  return normalizeMonthlyCloseReviewRow(data, householdId, monthKey);
}

export async function saveMonthlyCloseReview(householdId, monthKey, updates = {}) {
  if (!householdId || !monthKey) return normalizeMonthlyCloseReviewRow(null, householdId, monthKey);

  const client = requireSupabase();
  const payload = {
    household_id: householdId,
    month_key: monthKey,
    ...mapReviewUpdateToRow(updates),
  };

  const { data, error } = await client
    .from("monthly_close_reviews")
    .upsert(payload, { onConflict: "household_id,month_key" })
    .select("*")
    .single();

  if (error) throw error;
  return normalizeMonthlyCloseReviewRow(data, householdId, monthKey);
}

export async function toggleMonthlyCloseManualCheck(householdId, monthKey, checkId, checked) {
  const review = await getMonthlyCloseReview(householdId, monthKey);
  const manualChecks = mergeManualChecks(review.manualChecks, checkId, checked);
  return saveMonthlyCloseReview(householdId, monthKey, { manualChecks });
}

export async function markMonthlyCloseReviewed(householdId, monthKey) {
  if (!householdId || !monthKey) return normalizeMonthlyCloseReviewRow(null, householdId, monthKey);
  const client = requireSupabase();
  const reviewedBy = await getCurrentUserId(client);
  return saveMonthlyCloseReview(householdId, monthKey, buildReviewedUpdate(reviewedBy));
}

export async function reopenMonthlyCloseReview(householdId, monthKey) {
  return saveMonthlyCloseReview(householdId, monthKey, buildReopenUpdate());
}
