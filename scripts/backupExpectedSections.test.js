import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("backup expected sections", () => {
  it("includes full persisted finance sections in expected Supabase backup sections", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes("EXPECTED_SUPABASE_SECTIONS"), true);
    assert.equal(source.includes('"householdProfiles"'), true);
    assert.equal(source.includes('"creditCards"'), true);
    assert.equal(source.includes('"monthlyCardBalances"'), true);
    assert.equal(source.includes('"cardStatements"'), true);
    assert.equal(source.includes('"budgetCategories"'), true);
    assert.equal(source.includes('"transactions"'), true);
    assert.equal(source.includes('"transactionSplits"'), true);
    assert.equal(source.includes('"recurringPayments"'), true);
    assert.equal(source.includes('"recurringPaymentInstances"'), true);
    assert.equal(source.includes('"monthlyCloseReviews"'), true);
    assert.equal(source.includes('"incomeSources"'), true);
    assert.equal(source.includes('"incomeEntries"'), true);
    assert.equal(source.includes('"savingsGoals"'), true);
    assert.equal(source.includes('"savingsContributions"'), true);
    assert.equal(source.includes('"cashAccounts"'), true);
    assert.equal(source.includes('"accountBalanceSnapshots"'), true);
    assert.equal(source.includes('"liabilityAccounts"'), true);
    assert.equal(source.includes('"liabilityBalanceSnapshots"'), true);
  });

  it("includes full persisted finance sheets in Excel export", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes('"Card Statements"'), true);
    assert.equal(source.includes('"Transaction Splits"'), true);
    assert.equal(source.includes('"Recurring Payments"'), true);
    assert.equal(source.includes('"Recurring Instances"'), true);
    assert.equal(source.includes('"Monthly Close Reviews"'), true);
    assert.equal(source.includes('"Income Sources"'), true);
    assert.equal(source.includes('"Income Entries"'), true);
    assert.equal(source.includes('"Savings Goals"'), true);
    assert.equal(source.includes('"Savings Contributions"'), true);
    assert.equal(source.includes('"Cash Accounts"'), true);
    assert.equal(source.includes('"Account Balance Snapshots"'), true);
    assert.equal(source.includes('"Liability Accounts"'), true);
    assert.equal(source.includes('"Liability Balance Snapshots"'), true);
  });

  it("does not require computed summaries as persisted backup sections", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes('"dashboardCashFlowSummary"'), false);
    assert.equal(source.includes('"netWorthSummary"'), false);
    assert.equal(source.includes('"netWorthTrends"'), false);
    assert.equal(source.includes('"financialPositionSummary"'), false);
  });
});
