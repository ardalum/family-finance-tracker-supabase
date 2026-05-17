import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSavingsGoalOptions,
  calculateGoalProgress,
  calculateTotalSavedForGoal,
  getActiveSavingsGoals,
  normalizeSavingsContributionForm,
  normalizeSavingsGoalForm,
  summarizeSavingsByGoal,
  summarizeSavingsForMonth,
} from "./savingsService.js";

test("normalizeSavingsGoalForm applies safe defaults", () => {
  const normalized = normalizeSavingsGoalForm({ name: " Emergency Fund " });

  assert.equal(normalized.name, "Emergency Fund");
  assert.equal(normalized.goalType, "general");
  assert.equal(normalized.targetAmount, 0);
  assert.equal(normalized.startingAmount, 0);
  assert.equal(normalized.isActive, true);
});

test("normalizeSavingsContributionForm applies safe defaults", () => {
  const normalized = normalizeSavingsContributionForm({
    contributionDate: "2026-05-15",
    amount: "123.45",
  });

  assert.equal(normalized.monthKey, "2026-05");
  assert.equal(normalized.contributionType, "transfer");
  assert.equal(normalized.amount, 123.45);
});

test("summarizeSavingsForMonth sums selected month only", () => {
  const contributions = [
    { monthKey: "2026-05", amount: 100 },
    { monthKey: "2026-05", amount: 150 },
    { monthKey: "2026-04", amount: 400 },
  ];

  assert.equal(summarizeSavingsForMonth(contributions, "2026-05"), 250);
});

test("summarizeSavingsByGoal groups and sorts totals", () => {
  const goals = [
    { id: "g1", name: "Emergency" },
    { id: "g2", name: "Vacation" },
  ];
  const contributions = [
    { monthKey: "2026-05", savingsGoalId: "g1", amount: 500 },
    { monthKey: "2026-05", savingsGoalId: "g2", amount: 100 },
    { monthKey: "2026-05", savingsGoalId: "g1", amount: 200 },
  ];

  const result = summarizeSavingsByGoal(contributions, goals, "2026-05");
  assert.equal(result[0].label, "Emergency");
  assert.equal(result[0].amount, 700);
  assert.equal(result[1].label, "Vacation");
});

test("getActiveSavingsGoals excludes inactive goals", () => {
  const goals = [
    { id: "a", isActive: true },
    { id: "b", isActive: false },
  ];

  assert.deepEqual(
    getActiveSavingsGoals(goals).map((goal) => goal.id),
    ["a"],
  );
});

test("buildSavingsGoalOptions includes only active goals and sorts", () => {
  const options = buildSavingsGoalOptions([
    { id: "2", name: "Vacation", isActive: true },
    { id: "1", name: "Emergency", isActive: true },
    { id: "3", name: "Old", isActive: false },
  ]);

  assert.deepEqual(options, [
    { value: "1", label: "Emergency" },
    { value: "2", label: "Vacation" },
  ]);
});

test("calculateTotalSavedForGoal includes starting amount and contributions", () => {
  const goal = { id: "g1", startingAmount: 100 };
  const contributions = [
    { savingsGoalId: "g1", amount: 50 },
    { savingsGoalId: "g1", amount: 25 },
    { savingsGoalId: "g2", amount: 1000 },
  ];

  assert.equal(calculateTotalSavedForGoal(goal, contributions), 175);
});

test("calculateGoalProgress handles target amount safely", () => {
  const goal = { id: "g1", startingAmount: 100, targetAmount: 200 };
  const contributions = [{ savingsGoalId: "g1", amount: 50 }];

  const progress = calculateGoalProgress(goal, contributions);
  assert.equal(progress.totalSaved, 150);
  assert.equal(progress.targetAmount, 200);
  assert.equal(progress.percent, 75);
  assert.equal(progress.isComplete, false);
});

test("calculateGoalProgress with target 0 does not crash", () => {
  const goal = { id: "g1", startingAmount: 20, targetAmount: 0 };
  const contributions = [{ savingsGoalId: "g1", amount: 10 }];

  const progress = calculateGoalProgress(goal, contributions);
  assert.equal(progress.totalSaved, 30);
  assert.equal(progress.targetAmount, 0);
  assert.equal(progress.percent, 0);
});

test("invalid amounts are treated safely as zero", () => {
  const normalizedGoal = normalizeSavingsGoalForm({ targetAmount: "abc", startingAmount: "bad" });
  const normalizedContribution = normalizeSavingsContributionForm({ amount: "nope" });

  assert.equal(normalizedGoal.targetAmount, 0);
  assert.equal(normalizedGoal.startingAmount, 0);
  assert.equal(normalizedContribution.amount, 0);
});

test("negative adjustments are allowed and reflected in totals", () => {
  const goal = { id: "g1", startingAmount: 200, targetAmount: 500 };
  const contributions = [
    { savingsGoalId: "g1", amount: 100 },
    { savingsGoalId: "g1", amount: -25, contributionType: "adjustment" },
  ];

  const total = calculateTotalSavedForGoal(goal, contributions);
  const progress = calculateGoalProgress(goal, contributions);

  assert.equal(total, 275);
  assert.equal(progress.percent, 55);
});
