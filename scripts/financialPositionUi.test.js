import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("financial position ui", () => {
  it("renders key section headings", () => {
    const source = read("src/features/financialPosition/components/FinancialPosition.jsx");

    assert.equal(source.includes("Financial position month"), true);
    assert.equal(source.includes("Needs update"), true);
    assert.equal(source.includes("Insights"), true);
  });

  it("keeps primary action labels present", () => {
    const source = read("src/features/financialPosition/components/FinancialPosition.jsx");

    assert.equal(source.includes("Manage income"), true);
    assert.equal(source.includes("Manage savings"), true);
    assert.equal(source.includes("Manage accounts"), true);
    assert.equal(source.includes("Manage debts"), true);
    assert.equal(source.includes("Review net worth"), true);
    assert.equal(source.includes("View trends"), true);
  });

  it("uses no-liability confirmation instead of a missing-liability warning when reviewed", () => {
    const source = read("src/features/financialPosition/components/FinancialPosition.jsx");

    assert.equal(source.includes("liabilityReviewConfirmed"), true);
    assert.equal(source.includes("No liabilities confirmed for this month."), true);
    assert.equal(source.includes("summary.needsUpdate.netWorthIncomplete"), true);
    assert.equal(source.includes("!liabilityReviewConfirmed"), true);
  });
});
