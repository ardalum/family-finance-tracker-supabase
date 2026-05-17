import test from "node:test";
import assert from "node:assert/strict";

import { formatMonthKeyRange, getYtdInsightsData } from "./insightsYtdUtils.js";

test("formatMonthKeyRange returns months from January through selected month", () => {
  assert.deepEqual(formatMonthKeyRange("2026-03"), ["2026-01", "2026-02", "2026-03"]);
});

test("getYtdInsightsData handles empty data", () => {
  const ytd = getYtdInsightsData({ selectedMonth: "2026-03" });

  assert.equal(ytd.hasData, false);
  assert.equal(ytd.ytdSpendingTotal, 0);
  assert.equal(ytd.averageMonthlySpending, 0);
  assert.equal(ytd.highestSpendingMonth, null);
  assert.equal(ytd.ytdSpendingByMonth.length, 3);
});

test("getYtdInsightsData computes single month totals", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-01",
    transactionsByMonth: {
      "2026-01": [{ id: "1", amount: 100, transactionType: "expense", categoryId: "food" }],
    },
    budgetsByMonth: {
      "2026-01": [{ id: "food", name: "Food", monthlyAmount: 300 }],
    },
  });

  assert.equal(ytd.hasData, true);
  assert.equal(ytd.ytdSpendingTotal, 100);
  assert.equal(ytd.averageMonthlySpending, 100);
  assert.equal(ytd.highestSpendingMonth.monthKey, "2026-01");
});

test("getYtdInsightsData computes multiple months and selected month range", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-03",
    transactionsByMonth: {
      "2026-01": [{ id: "1", amount: 100, transactionType: "expense", categoryId: "food" }],
      "2026-02": [{ id: "2", amount: 200, transactionType: "expense", categoryId: "rent" }],
      "2026-03": [{ id: "3", amount: 50, transactionType: "expense", categoryId: "food" }],
      "2026-04": [{ id: "4", amount: 999, transactionType: "expense", categoryId: "ignored" }],
    },
    budgetsByMonth: {
      "2026-01": [{ id: "food", name: "Food", monthlyAmount: 300 }],
      "2026-02": [{ id: "rent", name: "Rent", monthlyAmount: 1000 }],
      "2026-03": [{ id: "food", name: "Food", monthlyAmount: 300 }],
      "2026-04": [{ id: "ignored", name: "Ignored", monthlyAmount: 1000 }],
    },
  });

  assert.equal(ytd.ytdSpendingTotal, 350);
  assert.equal(ytd.ytdSpendingByMonth.length, 3);
  assert.equal(ytd.highestSpendingMonth.monthKey, "2026-02");
});

test("refunds reduce YTD spending totals", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-02",
    transactionsByMonth: {
      "2026-01": [{ id: "1", amount: 120, transactionType: "expense", categoryId: "food" }],
      "2026-02": [{ id: "2", amount: 20, transactionType: "refund", categoryId: "food" }],
    },
    budgetsByMonth: {
      "2026-01": [{ id: "food", name: "Food", monthlyAmount: 300 }],
      "2026-02": [{ id: "food", name: "Food", monthlyAmount: 300 }],
    },
  });

  assert.equal(ytd.ytdSpendingTotal, 100);
  assert.equal(ytd.topCategoryYtd.label, "Food");
  assert.equal(ytd.topCategoryYtd.value, 100);
});

test("top merchant YTD is computed from net impact", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-03",
    transactionsByMonth: {
      "2026-01": [{ id: "1", amount: 90, transactionType: "expense", merchant: "Store A" }],
      "2026-02": [{ id: "2", amount: 20, transactionType: "refund", merchant: "Store A" }],
      "2026-03": [{ id: "3", amount: 80, transactionType: "expense", merchant: "Store B" }],
    },
  });

  assert.equal(ytd.topMerchantYtd.label, "Store B");
  assert.equal(ytd.topMerchantYtd.value, 80);
});

test("average monthly spending uses January through selected month range", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-04",
    transactionsByMonth: {
      "2026-01": [{ id: "1", amount: 100, transactionType: "expense" }],
      "2026-02": [{ id: "2", amount: 100, transactionType: "expense" }],
      "2026-03": [],
      "2026-04": [],
    },
  });

  assert.equal(ytd.ytdSpendingTotal, 200);
  assert.equal(ytd.averageMonthlySpending, 50);
});

test("partial-year behavior is flagged before December", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-05",
    transactionsByMonth: {
      "2026-05": [{ id: "1", amount: 40, transactionType: "expense" }],
    },
  });

  assert.equal(ytd.isPartialYear, true);
});

test("split transaction rows count by split category", () => {
  const ytd = getYtdInsightsData({
    selectedMonth: "2026-01",
    transactionsByMonth: {
      "2026-01": [
        {
          id: "1",
          amount: 100,
          transactionType: "expense",
          splitMode: true,
          splits: [
            { id: "s1", categoryId: "groceries", amount: 60 },
            { id: "s2", categoryId: "dining", amount: 40 },
          ],
        },
      ],
    },
    budgetsByMonth: {
      "2026-01": [
        { id: "groceries", name: "Groceries", monthlyAmount: 300 },
        { id: "dining", name: "Dining", monthlyAmount: 200 },
      ],
    },
  });

  assert.equal(ytd.ytdSpendingByCategory[0].label, "Groceries");
  assert.equal(ytd.ytdSpendingByCategory[0].value, 60);
});
