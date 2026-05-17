import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("backup expected sections", () => {
  it("includes income sections in expected Supabase backup sections", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes("EXPECTED_SUPABASE_SECTIONS"), true);
    assert.equal(source.includes('"cardStatements"'), true);
    assert.equal(source.includes('"incomeSources"'), true);
    assert.equal(source.includes('"incomeEntries"'), true);
    assert.equal(source.includes('"savingsGoals"'), true);
    assert.equal(source.includes('"savingsContributions"'), true);
  });

  it("includes income sheets in Excel export", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes('"Income Sources"'), true);
    assert.equal(source.includes('"Income Entries"'), true);
    assert.equal(source.includes('"Savings Goals"'), true);
    assert.equal(source.includes('"Savings Contributions"'), true);
  });
});
