import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNetWorthTrendRows,
  calculateNetWorthChange,
  getMonthKeysForRange,
  getNetWorthTrendStatus,
  summarizeAssetTrend,
  summarizeLiabilityTrend,
  summarizeNetWorthByMonth,
} from "./netWorthTrendService.js";

const cashAccounts = [
  { id: "a1", name: "Checking", accountType: "checking" },
  { id: "a2", name: "Savings", accountType: "savings" },
];

const liabilityAccounts = [{ id: "l1", name: "Card", liabilityType: "credit_card" }];

test("no snapshots", () => {
  const monthKeys = getMonthKeysForRange("2026-05", 3);
  const rows = summarizeNetWorthByMonth({
    monthKeys,
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
  });
  assert.equal(rows.length, 3);
  assert.equal(
    rows.every((row) => row.hasData === false),
    true,
  );
});

test("one month only", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-02", balanceAmount: 500 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
  });
  assert.equal(rows[0].netWorth, 500);
});

test("multiple months with missing month handling", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-03", "2026-04", "2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-03", snapshotDate: "2026-03-02", balanceAmount: 100 },
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-02", balanceAmount: 200 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
  });
  assert.equal(rows[1].hasData, false);
  assert.equal(rows[1].netWorth, null);
});

test("assets only", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-02", balanceAmount: 600 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
  });
  assert.equal(rows[0].totalAssets, 600);
  assert.equal(rows[0].totalLiabilities, 0);
});

test("liabilities only", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "l1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: 400,
      },
    ],
  });
  assert.equal(rows[0].totalAssets, 0);
  assert.equal(rows[0].totalLiabilities, 400);
  assert.equal(rows[0].netWorth, -400);
});

test("assets minus liabilities by month", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-02", balanceAmount: 700 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "l1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: 200,
      },
    ],
  });
  assert.equal(rows[0].netWorth, 500);
});

test("latest snapshot per account per month", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-01", balanceAmount: 100 },
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-20", balanceAmount: 300 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
  });
  assert.equal(rows[0].totalAssets, 300);
});

test("net worth change calculation and status", () => {
  assert.equal(calculateNetWorthChange(500, 100), 400);
  assert.equal(getNetWorthTrendStatus(10), "up");
  assert.equal(getNetWorthTrendStatus(-10), "down");
  assert.equal(getNetWorthTrendStatus(0), "flat");
  assert.equal(getNetWorthTrendStatus(null), "insufficient-data");
});

test("liability balances treated as positive owed amounts", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "l1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: -200,
      },
    ],
  });
  assert.equal(rows[0].totalLiabilities, 0);
});

test("savings goals and credit card statements are not included automatically", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
    savingsGoals: [{ id: "goal-1", targetAmount: 9999 }],
    cardStatements: [{ statementBalance: 800 }],
  });
  assert.equal(rows[0].hasData, false);
});

test("build trend rows and asset/liability trend summaries", () => {
  const monthRows = summarizeNetWorthByMonth({
    monthKeys: ["2026-04", "2026-05"],
    cashAccounts,
    accountBalanceSnapshots: [
      { cashAccountId: "a1", monthKey: "2026-04", snapshotDate: "2026-04-01", balanceAmount: 100 },
      { cashAccountId: "a1", monthKey: "2026-05", snapshotDate: "2026-05-01", balanceAmount: 250 },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "l1",
        monthKey: "2026-04",
        snapshotDate: "2026-04-01",
        balanceAmount: 80,
      },
      {
        liabilityAccountId: "l1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 60,
      },
    ],
  });

  const trendRows = buildNetWorthTrendRows(monthRows);
  assert.equal(trendRows.length, 2);
  assert.equal(trendRows[1].hasData, true);
  assert.equal(trendRows[1].netWorth, 190);

  const assetTrend = summarizeAssetTrend(monthRows);
  const liabilityTrend = summarizeLiabilityTrend(monthRows);
  assert.equal(assetTrend.change, 150);
  assert.equal(liabilityTrend.change, -20);
});

test("safe handling of invalid arrays", () => {
  const rows = summarizeNetWorthByMonth({
    monthKeys: ["2026-05"],
    cashAccounts: null,
    accountBalanceSnapshots: null,
    liabilityAccounts: null,
    liabilityBalanceSnapshots: null,
  });
  assert.equal(rows[0].hasData, false);
});
