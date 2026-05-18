import test from "node:test";
import assert from "node:assert/strict";

import {
  getActionableInsightCards,
  calculateSharePercent,
  getBudgetInsights,
  getBudgetVsActualRows,
  getBudgetUsageStatus,
  getMonthlyTrendRows,
  getTopCategories,
  getTopMerchants,
  getTransactionTypeMixRows,
} from "./insightsChartData.js";

test("getTopCategories sorts descending and filters non-positive values", () => {
  const rows = getTopCategories([
    { name: "Food", value: 220 },
    { name: "Travel", value: 0 },
    { name: "Rent", value: 1000 },
    { name: "Refunded", value: -15 },
  ]);

  assert.deepEqual(
    rows.map((row) => row.label),
    ["Rent", "Food"],
  );
});

test("calculateSharePercent handles zero totals", () => {
  assert.equal(calculateSharePercent(50, 0), 0);
  assert.equal(calculateSharePercent(50, -10), 0);
});

test("calculateSharePercent computes bounded percentages", () => {
  assert.equal(calculateSharePercent(25, 100), 25);
  assert.equal(calculateSharePercent(200, 100), 100);
});

test("getTopMerchants uses net impact and excludes payment/transfer/income from spending", () => {
  const rows = getTopMerchants([
    { merchant: "Grocer", amount: 80, transactionType: "expense" },
    { merchant: "Grocer", amount: 20, transactionType: "refund" },
    { merchant: "Card Payment", amount: 500, transactionType: "payment" },
    { merchant: "Income", amount: 1500, transactionType: "income" },
    { merchant: "Fuel", amount: 60, transactionType: "expense" },
  ]);

  assert.deepEqual(
    rows.map((row) => row.label),
    ["Grocer", "Fuel"],
  );
  assert.equal(rows[0].value, 60);
  assert.equal(rows[1].value, 60);
});

test("getTransactionTypeMixRows returns empty data safely", () => {
  assert.deepEqual(getTransactionTypeMixRows([]), []);
});

test("getTransactionTypeMixRows sorts by net impact magnitude", () => {
  const rows = getTransactionTypeMixRows([
    { amount: 100, transactionType: "expense" },
    { amount: 25, transactionType: "refund" },
    { amount: 500, transactionType: "payment" },
  ]);

  assert.equal(rows[0].type, "expense");
  assert.equal(rows[1].type, "refund");
  assert.equal(rows[2].type, "payment");
});

test("getBudgetUsageStatus labels over, near, safe, and unused", () => {
  assert.equal(getBudgetUsageStatus({ remaining: -1, percentUsed: 110, spent: 200 }), "over");
  assert.equal(getBudgetUsageStatus({ remaining: 10, percentUsed: 95, spent: 95 }), "near");
  assert.equal(getBudgetUsageStatus({ remaining: 100, percentUsed: 0, spent: 0 }), "unused");
  assert.equal(getBudgetUsageStatus({ remaining: 40, percentUsed: 60, spent: 60 }), "safe");
});

test("getBudgetInsights groups rows by status", () => {
  const insights = getBudgetInsights([
    { category: "A", remaining: -10, percentUsed: 120, spent: 120, budget: 100 },
    { category: "B", remaining: 5, percentUsed: 95, spent: 95, budget: 100 },
    { category: "C", remaining: 50, percentUsed: 50, spent: 50, budget: 100 },
    { category: "D", remaining: 100, percentUsed: 0, spent: 0, budget: 100 },
  ]);

  assert.equal(insights.over.length, 1);
  assert.equal(insights.near.length, 1);
  assert.equal(insights.safe.length, 2);
});

test("getMonthlyTrendRows maps ytd monthly rows safely", () => {
  const rows = getMonthlyTrendRows([
    { monthKey: "2026-01", label: "Jan 2026", value: 100 },
    { monthKey: "2026-02", label: "Feb 2026", value: 150 },
  ]);

  assert.deepEqual(rows, [
    { id: "2026-01", label: "Jan 2026", value: 100 },
    { id: "2026-02", label: "Feb 2026", value: 150 },
  ]);
});

test("getBudgetVsActualRows builds top budget comparison rows", () => {
  const rows = getBudgetVsActualRows([
    { category: "Food", spent: 120, budget: 200, status: "safe" },
    { category: "Rent", spent: 1000, budget: 1000, status: "near" },
  ]);

  assert.equal(rows[0].label, "Rent");
  assert.equal(rows[1].label, "Food");
  assert.equal(rows[1].budget, 200);
});

test("getActionableInsightCards returns data-driven recommendations", () => {
  const cards = getActionableInsightCards({
    summary: { spendingTotal: 500 },
    budgetInsights: { over: [{ category: "Food" }], near: [{ category: "Gas" }] },
    merchantRows: [{ label: "Store A", value: 200 }],
    categoryRows: [{ label: "Food", formattedValue: "$200.00" }],
    ytdData: {
      hasData: true,
      highestSpendingMonth: { label: "Feb 2026", formattedValue: "$900.00" },
    },
    netWorthTrendStatus: "down",
    hasNetWorthData: true,
    hasLiabilitySnapshots: false,
  });

  assert.ok(cards.length > 0);
  assert.ok(cards.some((card) => card.id === "over-budget"));
  assert.ok(cards.some((card) => card.id === "merchant-concentration"));
  assert.ok(cards.some((card) => card.id === "net-worth-trend"));
});

test("getActionableInsightCards suppresses missing-liability warning when no-liability review is confirmed", () => {
  const cards = getActionableInsightCards({
    summary: { spendingTotal: 200 },
    budgetInsights: { over: [], near: [] },
    merchantRows: [],
    categoryRows: [],
    ytdData: null,
    netWorthTrendStatus: "insufficient-data",
    hasNetWorthData: false,
    hasLiabilitySnapshots: false,
    liabilityReviewConfirmed: true,
  });

  assert.equal(
    cards.some((card) => card.id === "missing-liabilities"),
    false,
  );
});
