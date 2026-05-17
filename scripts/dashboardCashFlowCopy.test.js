import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard cash-flow copy", () => {
  it("keeps formula and limitation copy", () => {
    const source = read("src/features/dashboard/components/DashboardCashFlowSummary.jsx");
    assert.equal(source.includes("Estimated leftover formula"), true);
    assert.equal(source.includes("Unpaid card balances are not included"), true);
    assert.equal(
      source.includes("Savings lowers available cash here, but does not count as spending."),
      true,
    );
  });
});
