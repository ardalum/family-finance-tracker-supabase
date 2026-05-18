import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("monthly balance action copy", () => {
  it("uses compact no-balance action wording", () => {
    const desktop = read("src/features/creditCards/components/MonthlyBalanceDesktopTable.jsx");
    const mobile = read("src/features/creditCards/components/MonthlyBalanceCard.jsx");

    assert.equal(desktop.includes("Mark no balance"), true);
    assert.equal(desktop.includes("Mark checked, no balance"), false);
    assert.equal(desktop.includes("Reset to not checked"), true);
    assert.equal(mobile.includes("Mark no balance"), true);
  });
});
