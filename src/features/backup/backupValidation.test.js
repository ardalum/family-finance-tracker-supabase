import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMPUTED_SUPABASE_SECTIONS,
  getSupabaseBackupWarnings,
  hasAnyPersistedSupabaseRecords,
  parseBackupJsonText,
  PERSISTED_SUPABASE_SECTIONS,
} from "./backupValidation.js";

function createValidBackup() {
  return {
    source: "supabase",
    version: 8,
    exportedAt: "2026-05-17T00:00:00.000Z",
    household: { id: "household-1", name: "Test Household" },
    householdProfiles: [{ id: "profile-1", display_name: "Owner", is_active: true }],
    creditCards: [],
    monthlyCardBalances: [],
    cardStatements: [],
    budgetCategories: [],
    transactions: [],
    transactionSplits: [],
    recurringPayments: [],
    recurringPaymentInstances: [],
    monthlyCloseReviews: [],
    incomeSources: [],
    incomeEntries: [],
    savingsGoals: [],
    savingsContributions: [],
    cashAccounts: [],
    accountBalanceSnapshots: [],
    liabilityAccounts: [],
    liabilityBalanceSnapshots: [],
  };
}

describe("backup validation helpers", () => {
  it("parses valid JSON text", () => {
    const result = parseBackupJsonText('{"ok":true}');
    assert.equal(result.ok, true);
    assert.deepEqual(result.data, { ok: true });
  });

  it("rejects invalid JSON text with helpful message", () => {
    const result = parseBackupJsonText("{not-json}");
    assert.equal(result.ok, false);
    assert.equal(
      result.message,
      "Could not read that Supabase backup. Make sure it is valid JSON.",
    );
  });

  it("detects when backup has at least one persisted record section populated", () => {
    const backup = createValidBackup();
    assert.equal(hasAnyPersistedSupabaseRecords(backup), true);
  });

  it("detects empty persisted record backups", () => {
    const backup = createValidBackup();
    backup.householdProfiles = [];
    assert.equal(hasAnyPersistedSupabaseRecords(backup), false);
  });

  it("warns for missing required persisted sections", () => {
    const backup = createValidBackup();
    delete backup.incomeEntries;
    const warnings = getSupabaseBackupWarnings(backup, {
      requiredSections: PERSISTED_SUPABASE_SECTIONS,
    });
    assert.equal(
      warnings.some((warning) => warning.includes("incomeEntries")),
      true,
    );
  });

  it("warns for unknown sections and computed sections", () => {
    const backup = createValidBackup();
    backup.dashboardCashFlowSummary = { value: 123 };
    backup.someFutureSection = [];
    const warnings = getSupabaseBackupWarnings(backup, {
      requiredSections: PERSISTED_SUPABASE_SECTIONS,
    });
    assert.equal(
      warnings.some((warning) => warning.includes("dashboardCashFlowSummary")),
      true,
    );
    assert.equal(
      warnings.some((warning) => warning.includes("someFutureSection")),
      true,
    );
  });

  it("keeps persisted and computed section names unique", () => {
    assert.equal(new Set(PERSISTED_SUPABASE_SECTIONS).size, PERSISTED_SUPABASE_SECTIONS.length);
    assert.equal(new Set(COMPUTED_SUPABASE_SECTIONS).size, COMPUTED_SUPABASE_SECTIONS.length);
  });
});
