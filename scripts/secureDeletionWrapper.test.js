import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("secure deletion wrapper", () => {
  it("invokes delete-household-finance-data edge function", () => {
    const source = read("src/features/backup/secureDeletionService.js");
    assert.equal(source.includes('functions.invoke("delete-household-finance-data"'), true);
    assert.equal(source.includes("DELETE FINANCE DATA"), true);
  });

  it("routes backup service reset through secure wrapper", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes("resetSupabaseHouseholdFinanceData"), true);
    assert.equal(source.includes("deleteHouseholdFinanceDataSecurely"), true);
    assert.equal(source.includes("deleteActiveHouseholdFinanceData"), false);
  });
});
