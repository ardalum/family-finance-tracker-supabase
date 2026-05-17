import assert from "node:assert/strict";
import test from "node:test";
import { summarizeFinancialPositionForMonth } from "./financialPositionService.js";

const monthKey = "2026-05";

test("summarizes financial position totals from existing helpers", () => {
  const result = summarizeFinancialPositionForMonth({
    selectedMonth: monthKey,
    transactions: [
      { date: "2026-05-01", transactionType: "expense", amount: 300 },
      { date: "2026-05-04", transactionType: "refund", amount: 50 },
      { date: "2026-05-05", transactionType: "payment", amount: 200 },
    ],
    recurringPayments: [
      {
        id: "bill-1",
        active: true,
        name: "Rent",
        dueDay: 5,
        billType: "fixed",
        estimatedAmount: 1000,
      },
    ],
    recurringStatusByMonth: {},
    incomeEntries: [{ monthKey, amount: 3000 }],
    savingsContributions: [{ monthKey, amount: 250 }],
    cashAccounts: [{ supabaseId: "acc-1", name: "Checking", accountType: "checking" }],
    accountBalanceSnapshots: [
      { cashAccountId: "acc-1", monthKey, snapshotDate: "2026-05-20", balanceAmount: 1200 },
    ],
    liabilityAccounts: [{ supabaseId: "debt-1", name: "Card Debt", liabilityType: "credit_card" }],
    liabilityBalanceSnapshots: [
      { liabilityAccountId: "debt-1", monthKey, snapshotDate: "2026-05-18", balanceAmount: 400 },
    ],
  });

  assert.equal(result.incomeTotal, 3000);
  assert.equal(result.savingsTotal, 250);
  assert.equal(result.liquidCashTotal, 1200);
  assert.equal(result.totalDebt, 400);
  assert.equal(result.netWorthSummary.netWorth, 800);
  assert.equal(result.cashFlowSummary.estimatedLeftover, 1500);
});

test("flags missing income, savings, account snapshots, and liability snapshots", () => {
  const result = summarizeFinancialPositionForMonth({
    selectedMonth: monthKey,
    transactions: [],
    recurringPayments: [],
    recurringStatusByMonth: {},
    incomeEntries: [],
    savingsContributions: [],
    cashAccounts: [],
    accountBalanceSnapshots: [],
    liabilityAccounts: [],
    liabilityBalanceSnapshots: [],
  });

  assert.equal(result.needsUpdate.income, true);
  assert.equal(result.needsUpdate.savings, true);
  assert.equal(result.needsUpdate.accounts, true);
  assert.equal(result.needsUpdate.liabilities, true);
  assert.equal(result.needsUpdate.netWorth, true);
});

test("does not flag advisories when selected month data exists", () => {
  const result = summarizeFinancialPositionForMonth({
    selectedMonth: monthKey,
    transactions: [],
    recurringPayments: [],
    recurringStatusByMonth: {},
    incomeEntries: [{ monthKey, amount: 1 }],
    savingsContributions: [{ monthKey, amount: 1 }],
    cashAccounts: [{ supabaseId: "acc-1", name: "Cash", accountType: "cash" }],
    accountBalanceSnapshots: [
      { cashAccountId: "acc-1", monthKey, snapshotDate: "2026-05-10", balanceAmount: 10 },
    ],
    liabilityAccounts: [{ supabaseId: "debt-1", name: "Debt", liabilityType: "other" }],
    liabilityBalanceSnapshots: [
      { liabilityAccountId: "debt-1", monthKey, snapshotDate: "2026-05-12", balanceAmount: 4 },
    ],
  });

  assert.equal(result.needsUpdate.income, false);
  assert.equal(result.needsUpdate.savings, false);
  assert.equal(result.needsUpdate.accounts, false);
  assert.equal(result.needsUpdate.liabilities, false);
  assert.equal(result.needsUpdate.netWorth, false);
});
