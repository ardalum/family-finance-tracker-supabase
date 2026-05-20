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

test("cash position includes tracked movements on top of liquid account snapshots", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [
      { id: "checking", accountType: "checking", isActive: true },
      { id: "savings", accountType: "savings", isActive: true },
    ],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 4000,
      },
      {
        cashAccountId: "savings",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 1000,
      },
    ],
    accountMoneyMovements: [
      {
        sourceType: "income_entry",
        sourceId: "income-1",
        movementType: "income_deposit",
        direction: "inflow",
        amount: 1000,
        monthKey: "2026-05",
        accountId: "checking",
        isTracked: true,
      },
      {
        sourceType: "spending_transaction",
        sourceId: "spending-1",
        movementType: "spending_payment",
        direction: "outflow",
        amount: 250,
        monthKey: "2026-05",
        accountId: "checking",
        isTracked: true,
      },
      {
        sourceType: "recurring_payment",
        sourceId: "recurring-1",
        movementType: "recurring_bill_payment",
        direction: "outflow",
        amount: 300,
        monthKey: "2026-05",
        accountId: "savings",
        isTracked: true,
      },
      {
        sourceType: "credit_card_payment",
        sourceId: "card-1:2026-05",
        movementType: "credit_card_payment",
        direction: "outflow",
        amount: 150,
        monthKey: "2026-05",
        accountId: "checking",
        isTracked: true,
      },
    ],
  });

  assert.equal(result.cashPositionTotal, 5300);
});

test("outside/untracked movements do not change cash position", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 5000,
      },
    ],
    accountMoneyMovements: [
      {
        sourceType: "spending_transaction",
        sourceId: "spending-2",
        movementType: "spending_payment",
        direction: "outflow",
        amount: 200,
        monthKey: "2026-05",
        accountId: null,
        isTracked: false,
      },
    ],
  });

  assert.equal(result.cashPositionTotal, 5000);
});

test("credit card purchases do not reduce cash position without a tracked card-payment movement", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [{ id: "checking", accountType: "checking", isActive: true }],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        snapshotDate: "2026-05-31",
        monthKey: "2026-05",
        balanceAmount: 2400,
      },
    ],
    spendingTotal: 800,
  });

  assert.equal(result.cashPositionTotal, 2400);
});

test("non-liquid, liability, and other-month movements are excluded", () => {
  const result = getDashboardCashFlow({
    selectedMonth: "2026-05",
    cashAccounts: [
      { id: "checking", accountType: "checking", isActive: true },
      { id: "loan", accountType: "other_liability", isActive: true },
    ],
    accountBalanceSnapshots: [
      {
        cashAccountId: "checking",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 2000,
      },
      {
        cashAccountId: "loan",
        monthKey: "2026-05",
        snapshotDate: "2026-05-31",
        balanceAmount: 9999,
      },
    ],
    accountMoneyMovements: [
      {
        sourceType: "income_entry",
        sourceId: "income-3",
        movementType: "income_deposit",
        direction: "inflow",
        amount: 100,
        monthKey: "2026-05",
        accountId: "checking",
        isTracked: true,
      },
      {
        sourceType: "manual_adjustment",
        sourceId: "adj-1",
        movementType: "adjustment",
        direction: "outflow",
        amount: 500,
        monthKey: "2026-05",
        accountId: "loan",
        isTracked: true,
      },
      {
        sourceType: "income_entry",
        sourceId: "income-4",
        movementType: "income_deposit",
        direction: "inflow",
        amount: 999,
        monthKey: "2026-04",
        accountId: "checking",
        isTracked: true,
      },
    ],
  });

  assert.equal(result.cashPositionTotal, 2100);
});
