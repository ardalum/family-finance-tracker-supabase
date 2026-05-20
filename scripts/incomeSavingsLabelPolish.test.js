import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const incomeSource = readFileSync("src/features/income/components/Income.jsx", "utf8");
const savingsSource = readFileSync("src/features/savings/components/Savings.jsx", "utf8");

test("income uses professional display labels for types and frequencies", () => {
  assert.match(incomeSource, /formatIncomeTypeLabel/);
  assert.match(incomeSource, /formatIncomeFrequencyLabel/);
  assert.match(incomeSource, /\{formatIncomeTypeLabel\(type\)\}/);
  assert.match(incomeSource, /\{formatIncomeFrequencyLabel\(frequency\)\}/);
});

test("savings uses professional display labels for goal and contribution types", () => {
  assert.match(savingsSource, /formatSavingsGoalTypeLabel/);
  assert.match(savingsSource, /formatSavingsContributionTypeLabel/);
  assert.match(savingsSource, /\{formatSavingsGoalTypeLabel\(goalType\)\}/);
  assert.match(savingsSource, /\{formatSavingsContributionTypeLabel\(contributionType\)\}/);
});

test("income and savings keep stored enum values unchanged in select option values", () => {
  assert.match(incomeSource, /<option key=\{type\} value=\{type\}>/);
  assert.match(incomeSource, /<option key=\{frequency\} value=\{frequency\}>/);
  assert.match(savingsSource, /<option key=\{goalType\} value=\{goalType\}>/);
  assert.match(savingsSource, /<option key=\{contributionType\} value=\{contributionType\}>/);
});
