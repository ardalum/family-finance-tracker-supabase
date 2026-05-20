import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const transactionFormSource = readFileSync(
  "src/features/spending/components/TransactionForm.jsx",
  "utf8",
);
const quickAddSource = readFileSync(
  "src/features/quickAdd/components/QuickAddTransactionModal.jsx",
  "utf8",
);
const helperSource = readFileSync("src/features/spending/categoryBudgetUsage.js", "utf8");

test("budget usage helper supports missing-budget and over-budget labels", () => {
  assert.match(helperSource, /No budget set/);
  assert.match(helperSource, /Over by/);
  assert.match(helperSource, /used/);
  assert.match(helperSource, /left/);
});

test("transaction form category picker uses budget usage labels", () => {
  assert.match(transactionFormSource, /formatCategoryBudgetUsageLabel/);
  assert.match(transactionFormSource, /buildCategoryBudgetUsageMap/);
});

test("quick add category picker uses budget usage labels", () => {
  assert.match(quickAddSource, /formatCategoryBudgetUsageLabel/);
  assert.match(quickAddSource, /buildCategoryBudgetUsageMap/);
});
