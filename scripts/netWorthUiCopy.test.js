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
    source.includes(
      "Net worth does not change spending, income, savings, budget, or cash-flow totals.",
    ),
    true,
  );
});
