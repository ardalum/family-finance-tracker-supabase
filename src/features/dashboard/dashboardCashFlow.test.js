import assert from "node:assert/strict";
import { test } from "node:test";
import { getDashboardCashFlow } from "./dashboardCashFlow.js";

test("keeps budget remaining separate from planned cash cushion", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 5000 }],
    spendingTotal: 2200,
    budgetTotal: 4000,
    remainingBudget: 1800,
    recurringRemaining: 600,
    unpaidCardBalanceTotal: 700,
    savingsContributions: [{ monthKey: "2026-05", amount: 400 }],
  });

  assert.equal(result.remainingBudget, 1800);
  assert.equal(result.plannedCashCushion, 3300);
});

test("does not subtract spending from planned cash cushion", () => {
  const base = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    recurringRemaining: 500,
    unpaidCardBalanceTotal: 250,
    savingsContributions: [{ monthKey: "2026-05", amount: 100 }],
    spendingTotal: 0,
  });
  const withHigherSpending = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    recurringRemaining: 500,
    unpaidCardBalanceTotal: 250,
    savingsContributions: [{ monthKey: "2026-05", amount: 100 }],
    spendingTotal: 9999,
  });

  assert.equal(base.plannedCashCushion, 2150);
  assert.equal(withHigherSpending.plannedCashCushion, 2150);
});

test("includes recurring and unpaid cards in upcoming obligations", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    recurringRemaining: 600,
    unpaidCardBalanceTotal: 900,
  });

  assert.equal(result.upcomingObligationsTotal, 1500);
  assert.equal(result.hasUpcomingObligations, true);
  assert.equal(result.hasUnpaidCardObligations, true);
});

test("shows cash position using account snapshots when available", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-10",
        balanceAmount: 1234.56,
      },
    ],
  });

  assert.equal(result.cashPositionTotal, 1234.56);
  assert.equal(result.hasCashSnapshotData, true);
});

test("handles missing account snapshots safely", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [],
  });

  assert.equal(result.cashPositionTotal, 0);
  assert.equal(result.hasCashSnapshotData, false);
});

test("savings remains separate from spending totals", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    savingsContributions: [{ monthKey: "2026-05", amount: 250 }],
    spendingTotal: 400,
  });

  assert.equal(result.savingsContributionTotal, 250);
  assert.equal(result.spendingTotal, 400);
});

test("missing income keeps planned cash cushion in not-ready state support", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [],
    recurringRemaining: 300,
    unpaidCardBalanceTotal: 200,
    savingsContributions: [{ monthKey: "2026-05", amount: 100 }],
  });

  assert.equal(result.hasIncomeData, false);
  assert.equal(result.plannedCashCushion, -600);
});

test("cash position is based on snapshots, not income entries", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 3000 }],
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 4000,
      },
    ],
  });

  assert.equal(result.incomeTotal, 3000);
  assert.equal(result.cashPositionTotal, 4000);
});

test("obligations stay separate from cash position without account-level movement", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    incomeEntries: [{ monthKey: "2026-05", amount: 5000 }],
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 5000,
      },
    ],
    recurringRemaining: 1500,
    unpaidCardBalanceTotal: 750,
  });

  assert.equal(result.cashPositionTotal, 5000);
  assert.equal(result.upcomingObligationsTotal, 2250);
  assert.equal(result.plannedCashCushion, 2750);
});

test("cash position uses the latest selected-month snapshot for liquid accounts", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [
      { id: "checking", accountType: "checking", isActive: true },
      { id: "savings", accountType: "savings", isActive: true },
      { id: "emergency", accountType: "emergency_fund", isActive: true },
    ],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 1000,
      },
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 1200,
      },
      {
        cashAccountId: "savings",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 3000,
      },
      {
        cashAccountId: "emergency",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 9000,
      },
      {
        cashAccountId: "checking",
        monthKey: "2026-04",
        snapshotDate: "2026-04-30",
        balanceAmount: 9999,
      },
    ],
  });

  assert.equal(result.cashPositionTotal, 4200);
});
