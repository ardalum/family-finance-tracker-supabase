import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("net worth ui copy keeps inclusion and exclusion guidance", () => {
  const source = readFileSync("src/features/netWorth/components/NetWorth.jsx", "utf8");

  assert.equal(source.includes("Net worth uses manual account and debt snapshots."), true);
  assert.equal(
    source.includes(
      "Savings goals are not counted unless represented by account balance snapshots.",
    ),
    true,
  );
  assert.equal(
    source.includes("Credit card balances are not counted unless entered as liability snapshots."),
    true,
  );
  assert.equal(
    source.includes("After paying debt, update account snapshots so cash reflects the payment."),
    true,
  );
  assert.equal(
    source.includes(
      "Net worth does not change spending, income, savings, budget, or cash-flow totals.",
    ),
    true,
  );
});

test("net worth ui honors no-liability confirmation copy", () => {
  const source = readFileSync("src/features/netWorth/components/NetWorth.jsx", "utf8");

  assert.equal(source.includes("liabilityReviewConfirmed"), true);
  assert.equal(source.includes("No liabilities confirmed for this month."), true);
  assert.equal(
    source.includes(
      "No asset snapshots for this month yet. No liabilities are confirmed for this month.",
    ),
    true,
  );
});

test("net worth ui labels carried-forward liability balances", () => {
  const source = readFileSync("src/features/netWorth/components/NetWorth.jsx", "utf8");

  assert.equal(source.includes("Carried forward from"), true);
});
