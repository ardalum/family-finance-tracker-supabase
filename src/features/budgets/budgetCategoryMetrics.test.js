import assert from "node:assert/strict";
import test from "node:test";

import {
  getBudgetDelta,
  getCategorySharePercent,
  getSpentPercent,
} from "./budgetCategoryMetrics.js";

test("category share percent is calculated safely", () => {
  assert.equal(getCategorySharePercent(300, 1200), 25);
  assert.equal(getCategorySharePercent(300, 0), 0);
  assert.equal(getCategorySharePercent(0, 1200), 0);
  assert.equal(getCategorySharePercent(undefined, 1200), 0);
});

test("spent percent is calculated safely", () => {
  assert.equal(getSpentPercent(450, 600), 75);
  assert.equal(getSpentPercent(0, 600), 0);
  assert.equal(getSpentPercent(75, 0), 100);
  assert.equal(getSpentPercent(0, 0), 0);
});

test("zero or missing budget does not divide by zero and delta is safe", () => {
  assert.deepEqual(getBudgetDelta(0, 75), {
    remaining: -75,
    overAmount: 75,
    isOverBudget: true,
    hasBudget: false,
  });
  assert.deepEqual(getBudgetDelta(undefined, 0), {
    remaining: 0,
    overAmount: 0,
    isOverBudget: false,
    hasBudget: false,
  });
});

test("over-budget category is identified correctly", () => {
  const delta = getBudgetDelta(200, 210);
  assert.equal(delta.isOverBudget, true);
  assert.equal(delta.overAmount, 10);
  assert.equal(delta.remaining, -10);
});
