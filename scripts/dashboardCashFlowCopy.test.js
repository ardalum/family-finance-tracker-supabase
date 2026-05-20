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

  it("includes cash position help text and timing guidance for card purchases", () => {
    const source = read("src/features/dashboard/components/DashboardCashFlowSummary.jsx");
    assert.equal(source.includes("calculation info"), true);
    assert.equal(
      source.includes(
        "Credit card purchases count as spending and budget activity, but do not reduce Cash Position until the card is paid from a tracked account.",
      ),
      true,
    );
    assert.equal(
      source.includes(
        "Total tracked bank/cash account balance for the selected month. Starts from account snapshots, then applies tracked money in/out movements.",
      ),
      true,
    );
  });
});
