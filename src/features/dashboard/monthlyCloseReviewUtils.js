export function createDefaultMonthlyCloseReview(householdId, monthKey) {
  return {
    householdId: householdId ?? "",
    monthKey: monthKey ?? "",
    status: "in_progress",
    manualChecks: {},
    notes: "",
    reviewedBy: null,
    reviewedAt: null,
    createdAt: null,
    updatedAt: null,
  };
}

export function normalizeMonthlyCloseReviewRow(row, householdId, monthKey) {
  if (!row) return createDefaultMonthlyCloseReview(householdId, monthKey);

  return {
    householdId: row.household_id ?? householdId ?? "",
    monthKey: row.month_key ?? monthKey ?? "",
    status: row.status ?? "in_progress",
    manualChecks: isPlainObject(row.manual_checks) ? row.manual_checks : {},
    notes: row.notes ?? "",
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

export function mergeManualChecks(currentChecks, checkId, checked) {
  const nextChecks = isPlainObject(currentChecks) ? { ...currentChecks } : {};
  nextChecks[checkId] = Boolean(checked);
  return nextChecks;
}

export function buildReviewedUpdate(userId, now = new Date()) {
  return {
    status: "reviewed",
    reviewedAt: now.toISOString(),
    reviewedBy: userId ?? null,
  };
}

export function buildReopenUpdate() {
  return {
    status: "in_progress",
    reviewedAt: null,
    reviewedBy: null,
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
