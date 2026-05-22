import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard cash-flow copy", () => {
  it("uses current net-cash-flow framing with clear budget and cushion language", () => {
    const source = read("src/features/dashboard/components/DashboardCashFlowSummary.jsx");
    assert.equal(source.includes("Net cash flow"), true);
    assert.equal(source.includes("Income minus spending this month"), true);
    assert.equal(source.includes("vs budget remaining"), true);
    assert.equal(source.includes("Planned cushion"), true);
    assert.equal(source.includes("Estimated leftover"), false);
    assert.equal(source.includes("Positive cash flow"), false);
    assert.equal(source.includes("Negative cash flow"), false);
  });

  it("keeps key finance summary metrics visible", () => {
    const source = read("src/features/dashboard/components/DashboardCashFlowSummary.jsx");
    assert.equal(source.includes("Income"), true);
    assert.equal(source.includes("Spending"), true);
    assert.equal(source.includes("Cash position"), true);
    assert.equal(source.includes("Month trend"), true);
  });
});
