import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("finance card tooltip coverage", () => {
  it("adds accessible calculation tooltips to financial position and net worth cards", () => {
    const financialPositionSource = read(
      "src/features/financialPosition/components/FinancialPosition.jsx",
    );
    const netWorthSource = read("src/features/netWorth/components/NetWorth.jsx");

    assert.equal(financialPositionSource.includes("Liquid cash"), true);
    assert.equal(financialPositionSource.includes("Net worth"), true);
    assert.equal(financialPositionSource.includes("calculation info"), true);
    assert.equal(netWorthSource.includes("Net worth"), true);
    assert.equal(netWorthSource.includes("calculation info"), true);
  });

  it("renders payment overview copy in the dashboard card summary", () => {
    const source = read("src/features/dashboard/components/CreditCardPaymentOverview.jsx");
    assert.equal(source.includes("Credit Card Payment Overview"), true);
    assert.equal(source.includes("Utilization"), true);
    assert.equal(source.includes("due within 7 days"), true);
  });
});
