import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard cash-flow copy", () => {
  it("uses financial pulse framing and removes misleading leftover/cash-flow badges", () => {
    const source = read("src/features/dashboard/components/DashboardCashFlowSummary.jsx");
    assert.equal(source.includes("Financial Pulse"), true);
    assert.equal(source.includes("Card purchases count toward spending and budgets."), true);
    assert.equal(source.includes("Planned cash cushion"), true);
    assert.equal(source.includes("Estimated leftover"), false);
    assert.equal(source.includes("Positive cash flow"), false);
    assert.equal(source.includes("Negative cash flow"), false);
    assert.equal(source.includes("Savings this month"), true);
  });
});
