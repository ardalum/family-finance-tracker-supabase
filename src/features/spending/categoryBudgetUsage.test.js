import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCategoryBudgetUsageMap,
  formatCategoryBudgetUsageLabel,
} from "./categoryBudgetUsage.js";

test("category usage shows spent, budgeted, and remaining when budget exists", () => {
  const usageMap = buildCategoryBudgetUsageMap(
    [{ id: "cat-1", name: "Groceries", monthlyAmount: 600 }],
    [{ id: "txn-1", amount: 450, transactionType: "expense", categoryId: "cat-1" }],
  );

  const usage = usageMap.get("cat-1");
  assert.equal(usage.hasBudget, true);
  assert.equal(usage.spent, 450);
  assert.equal(usage.remaining, 150);
  assert.match(formatCategoryBudgetUsageLabel("Groceries", usage), /used/);
  assert.match(formatCategoryBudgetUsageLabel("Groceries", usage), /left/);
});

test("category usage shows over-budget state", () => {
  const usageMap = buildCategoryBudgetUsageMap(
    [{ id: "cat-1", name: "Dining Out", monthlyAmount: 200 }],
    [{ id: "txn-1", amount: 210, transactionType: "expense", categoryId: "cat-1" }],
  );

  const usage = usageMap.get("cat-1");
  assert.equal(usage.isOver, true);
  assert.match(formatCategoryBudgetUsageLabel("Dining Out", usage), /Over by/);
});

test("category usage handles missing and zero budgets safely", () => {
  const noBudgetUsage = buildCategoryBudgetUsageMap(
    [{ id: "cat-1", name: "Gas", monthlyAmount: 0 }],
    [{ id: "txn-1", amount: 75, transactionType: "expense", categoryId: "cat-1" }],
  ).get("cat-1");

  assert.equal(noBudgetUsage.hasBudget, false);
  assert.equal(formatCategoryBudgetUsageLabel("Gas", noBudgetUsage), "Gas - No budget set");
});
