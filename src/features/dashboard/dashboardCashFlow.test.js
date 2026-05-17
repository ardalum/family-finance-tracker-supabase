import assert from "node:assert/strict";
import { test } from "node:test";
import { getDashboardCashFlow } from "./dashboardCashFlow.js";

test("full data calculation uses income, spending, recurring remaining, and savings", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 5000 }],
    savingsContributions: [{ monthKey: "2026-05", amount: 400 }],
    spendingTotal: 2200,
    recurringRemaining: 600,
  });

  assert.equal(result.incomeTotal, 5000);
  assert.equal(result.spendingTotal, 2200);
  assert.equal(result.savingsContributionTotal, 400);
  assert.equal(result.recurringRemaining, 600);
  assert.equal(result.estimatedLeftover, 1800);
  assert.equal(result.status, "positive");
});

test("no income entries returns missing-income state and not-ready baseline", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [],
    savingsContributions: [{ monthKey: "2026-05", amount: 200 }],
    spendingTotal: 1000,
    recurringRemaining: 300,
  });

  assert.equal(result.incomeTotal, 0);
  assert.equal(result.hasIncomeData, false);
  assert.equal(result.status, "missing-income");
  assert.equal(result.estimatedLeftover, -1500);
});

test("savings reduces estimated leftover", () => {
  const withSavings = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    savingsContributions: [{ monthKey: "2026-05", amount: 500 }],
    spendingTotal: 1000,
    recurringRemaining: 200,
  });
  const withoutSavings = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    savingsContributions: [],
    spendingTotal: 1000,
    recurringRemaining: 200,
  });

  assert.equal(withoutSavings.estimatedLeftover - withSavings.estimatedLeftover, 500);
});

test("formula correctness: income - spending - recurring remaining - savings", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 4200 }],
    savingsContributions: [{ monthKey: "2026-05", amount: 350 }],
    spendingTotal: 1800,
    recurringRemaining: 650,
  });

  assert.equal(result.estimatedLeftover, 1400);
});

test("recurring remaining reduces estimated leftover", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    savingsContributions: [],
    spendingTotal: 1200,
    recurringRemaining: 700,
  });

  assert.equal(result.estimatedLeftover, 1100);
});

test("zero savings works and negative leftover is flagged", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 1000 }],
    savingsContributions: [],
    spendingTotal: 1300,
    recurringRemaining: 200,
  });

  assert.equal(result.savingsContributionTotal, 0);
  assert.equal(result.estimatedLeftover, -500);
  assert.equal(result.status, "negative");
});

test("no recurring bills is handled safely", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 2000 }],
    savingsContributions: [],
    spendingTotal: 500,
    recurringRemaining: 0,
  });

  assert.equal(result.recurringRemaining, 0);
  assert.equal(result.hasRecurringRemaining, false);
  assert.equal(result.estimatedLeftover, 1500);
});

test("refund-style lower spending preserves available cash", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 1500 }],
    savingsContributions: [],
    spendingTotal: 200,
    recurringRemaining: 100,
  });

  assert.equal(result.estimatedLeftover, 1200);
});

test("income does not change spending total field", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 9999 }],
    savingsContributions: [],
    spendingTotal: 432.1,
    recurringRemaining: 0,
  });

  assert.equal(result.spendingTotal, 432.1);
});

test("unpaid card balance is not included in estimated leftover formula", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 2500 }],
    savingsContributions: [{ monthKey: "2026-05", amount: 100 }],
    spendingTotal: 1400,
    recurringRemaining: 300,
    unpaidCardBalance: 9999,
  });

  assert.equal(result.estimatedLeftover, 700);
});

test("invalid or missing arrays are handled safely", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: null,
    savingsContributions: undefined,
    spendingTotal: 0,
    recurringRemaining: 0,
  });

  assert.equal(result.incomeTotal, 0);
  assert.equal(result.savingsContributionTotal, 0);
  assert.equal(result.status, "missing-income");
});
