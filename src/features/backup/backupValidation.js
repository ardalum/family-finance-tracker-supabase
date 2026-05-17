export const PERSISTED_SUPABASE_SECTIONS = [
  "household",
  "householdProfiles",
  "creditCards",
  "monthlyCardBalances",
  "cardStatements",
  "budgetCategories",
  "transactions",
  "transactionSplits",
  "recurringPayments",
  "recurringPaymentInstances",
  "monthlyCloseReviews",
  "incomeSources",
  "incomeEntries",
  "savingsGoals",
  "savingsContributions",
  "cashAccounts",
  "accountBalanceSnapshots",
  "liabilityAccounts",
  "liabilityBalanceSnapshots",
];

export const COMPUTED_SUPABASE_SECTIONS = [
  "dashboardCashFlowSummary",
  "netWorthSummary",
  "netWorthTrends",
  "financialPositionSummary",
  "insightsComputed",
  "insightsCharts",
  "insightsYtd",
  "insightsYearOverYear",
];

const SUPABASE_TOP_LEVEL_META_KEYS = ["version", "source", "exportedAt"];

export function parseBackupJsonText(text) {
  try {
    return {
      ok: true,
      data: JSON.parse(text),
    };
  } catch {
    return {
      ok: false,
      message: "Could not read that Supabase backup. Make sure it is valid JSON.",
    };
  }
}

export function getSupabaseBackupWarnings(backup, { requiredSections = [] } = {}) {
  const warnings = [];
  if (!backup || typeof backup !== "object") return warnings;

  const missingRequired = requiredSections.filter((section) => !(section in backup));
  if (missingRequired.length > 0) {
    warnings.push(
      `This backup is missing expected section(s): ${missingRequired.join(", ")}. Import may skip those data types.`,
    );
  }

  const presentComputedSections = COMPUTED_SUPABASE_SECTIONS.filter((section) => section in backup);
  if (presentComputedSections.length > 0) {
    warnings.push(
      `Computed section(s) found and ignored during restore: ${presentComputedSections.join(", ")}.`,
    );
  }

  const knownSections = new Set([
    ...SUPABASE_TOP_LEVEL_META_KEYS,
    ...PERSISTED_SUPABASE_SECTIONS,
    ...COMPUTED_SUPABASE_SECTIONS,
  ]);
  const unknownSections = Object.keys(backup).filter((key) => !knownSections.has(key));
  if (unknownSections.length > 0) {
    warnings.push(
      `Unknown section(s) found and ignored during restore: ${unknownSections.join(", ")}.`,
    );
  }

  return warnings;
}

export function hasAnyPersistedSupabaseRecords(backup) {
  if (!backup || typeof backup !== "object") return false;
  return PERSISTED_SUPABASE_SECTIONS.filter((section) => section !== "household").some((section) =>
    Array.isArray(backup[section]) ? backup[section].length > 0 : false,
  );
}
