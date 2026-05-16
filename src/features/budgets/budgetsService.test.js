import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createBudgetCopyPlan, getTotalMonthlyBudget } from "./budgetsService.js";

describe("budget service", () => {
  it("creates a copy plan from source budget categories", () => {
    const plan = createBudgetCopyPlan([
      { name: "Groceries", monthlyAmount: 750, notes: "Food and household items" },
      { name: "Gas", monthlyAmount: 180, notes: "" },
    ]);

    assert.deepEqual(plan, [
      { name: "Groceries", monthlyAmount: 750, notes: "Food and household items" },
      { name: "Gas", monthlyAmount: 180, notes: "" },
    ]);
  });

  it("skips categories that already exist in the target month", () => {
    const plan = createBudgetCopyPlan(
      [
        { name: "Groceries", monthlyAmount: 750, notes: "Food" },
        { name: "Gas", monthlyAmount: 180, notes: "" },
      ],
      [{ name: " groceries " }],
    );

    assert.deepEqual(plan, [{ name: "Gas", monthlyAmount: 180, notes: "" }]);
  });

  it("treats invalid monthly amounts as zero when creating a copy plan", () => {
    const plan = createBudgetCopyPlan([{ name: "Dining", monthlyAmount: "abc", notes: null }]);

    assert.deepEqual(plan, [{ name: "Dining", monthlyAmount: 0, notes: "" }]);
  });

  it("calculates total monthly budget", () => {
    const total = getTotalMonthlyBudget([
      { monthlyAmount: 100 },
      { monthlyAmount: "50" },
      { monthlyAmount: null },
    ]);

    assert.equal(total, 150);
  });
});
