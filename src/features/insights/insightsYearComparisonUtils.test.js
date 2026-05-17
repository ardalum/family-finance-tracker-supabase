import test from "node:test";
import assert from "node:assert/strict";

import { getYearOverYearInsightsData } from "./insightsYearComparisonUtils.js";

test("returns empty-state friendly result when no previous-year data", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-03",
    transactionsByMonth: {
      "2026-03": [{ amount: 100, transactionType: "expense" }],
    },
  });

  assert.equal(result.hasPreviousYearData, false);
  assert.equal(result.previousMonthsWithData, 0);
});

test("selected month compares with same month previous year", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-04",
    transactionsByMonth: {
      "2026-04": [{ amount: 200, transactionType: "expense" }],
      "2025-04": [{ amount: 150, transactionType: "expense" }],
    },
  });

  assert.equal(result.selectedMonthComparison.current, 200);
  assert.equal(result.selectedMonthComparison.previous, 150);
  assert.equal(result.selectedMonthComparison.delta, 50);
});

test("current YTD compares with previous YTD same period", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-03",
    transactionsByMonth: {
      "2026-01": [{ amount: 100, transactionType: "expense" }],
      "2026-02": [{ amount: 100, transactionType: "expense" }],
      "2026-03": [{ amount: 100, transactionType: "expense" }],
      "2025-01": [{ amount: 50, transactionType: "expense" }],
      "2025-02": [{ amount: 50, transactionType: "expense" }],
      "2025-03": [{ amount: 50, transactionType: "expense" }],
    },
  });

  assert.equal(result.ytdComparison.current, 300);
  assert.equal(result.ytdComparison.previous, 150);
});

test("average monthly spending comparison uses same period month counts", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-02",
    transactionsByMonth: {
      "2026-01": [{ amount: 90, transactionType: "expense" }],
      "2026-02": [{ amount: 110, transactionType: "expense" }],
      "2025-01": [{ amount: 40, transactionType: "expense" }],
      "2025-02": [{ amount: 60, transactionType: "expense" }],
    },
  });

  assert.equal(result.averageComparison.current, 100);
  assert.equal(result.averageComparison.previous, 50);
});

test("category deltas are computed", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-01",
    transactionsByMonth: {
      "2026-01": [{ amount: 100, transactionType: "expense", categoryId: "food" }],
      "2025-01": [{ amount: 70, transactionType: "expense", categoryId: "food" }],
    },
    budgetsByMonth: {
      "2026-01": [{ id: "food", name: "Food", monthlyAmount: 300 }],
      "2025-01": [{ id: "food", name: "Food", monthlyAmount: 300 }],
    },
  });

  assert.equal(result.categoryDeltas[0].label, "Food");
  assert.equal(result.categoryDeltas[0].delta, 30);
});

test("merchant deltas are computed", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-01",
    transactionsByMonth: {
      "2026-01": [{ amount: 120, transactionType: "expense", merchant: "Store A" }],
      "2025-01": [{ amount: 80, transactionType: "expense", merchant: "Store A" }],
    },
  });

  assert.equal(result.merchantDeltas[0].label, "Store A");
  assert.equal(result.merchantDeltas[0].delta, 40);
});

test("refunds reduce totals in comparison", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-01",
    transactionsByMonth: {
      "2026-01": [
        { amount: 100, transactionType: "expense" },
        { amount: 20, transactionType: "refund" },
      ],
      "2025-01": [{ amount: 60, transactionType: "expense" }],
    },
  });

  assert.equal(result.selectedMonthComparison.current, 80);
  assert.equal(result.selectedMonthComparison.previous, 60);
});

test("selected month controls comparison period", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-02",
    transactionsByMonth: {
      "2026-01": [{ amount: 10, transactionType: "expense" }],
      "2026-02": [{ amount: 10, transactionType: "expense" }],
      "2026-03": [{ amount: 999, transactionType: "expense" }],
      "2025-01": [{ amount: 5, transactionType: "expense" }],
      "2025-02": [{ amount: 5, transactionType: "expense" }],
      "2025-03": [{ amount: 999, transactionType: "expense" }],
    },
  });

  assert.equal(result.ytdComparison.current, 20);
  assert.equal(result.ytdComparison.previous, 10);
});

test("partial previous-year behavior is flagged", () => {
  const result = getYearOverYearInsightsData({
    selectedMonth: "2026-03",
    transactionsByMonth: {
      "2026-01": [{ amount: 100, transactionType: "expense" }],
      "2026-02": [{ amount: 100, transactionType: "expense" }],
      "2026-03": [{ amount: 100, transactionType: "expense" }],
      "2025-01": [{ amount: 50, transactionType: "expense" }],
    },
  });

  assert.equal(result.hasPreviousYearData, true);
  assert.equal(result.isPartialPreviousYear, true);
  assert.equal(result.previousMonthsWithData, 1);
  assert.equal(result.previousMonthsExpected, 3);
});
