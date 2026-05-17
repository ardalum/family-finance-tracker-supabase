import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateNetWorth,
  getLatestSnapshotsForMonth,
  summarizeAssetsForMonth,
  summarizeLiabilitiesForMonth,
  summarizeNetWorthForMonth,
} from "./netWorthService.js";

const cashAccounts = [
  { id: "cash-1", name: "Checking", accountType: "checking" },
  { id: "cash-2", name: "Savings", accountType: "savings" },
];

const liabilityAccounts = [
  { id: "debt-1", name: "Card Debt", liabilityType: "credit_card", linkedCreditCardId: "card-1" },
  { id: "debt-2", name: "Auto Loan", liabilityType: "auto_loan" },
];

test("no snapshots returns empty-state ready net worth summary", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
    monthKey: "2026-05",
  });

  assert.equal(summary.totalAssets, 0);
  assert.equal(summary.totalLiabilities, 0);
  assert.equal(summary.netWorth, 0);
  assert.equal(summary.hasAnySnapshots, false);
  assert.equal(summary.status, "missing-data");
});

test("assets only summary", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-10",
        balanceAmount: 1200,
      },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [],
    monthKey: "2026-05",
  });

  assert.equal(summary.totalAssets, 1200);
  assert.equal(summary.totalLiabilities, 0);
  assert.equal(summary.netWorth, 1200);
  assert.equal(summary.status, "positive");
});

test("liabilities only summary", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-10",
        balanceAmount: 400,
      },
    ],
    monthKey: "2026-05",
  });

  assert.equal(summary.totalAssets, 0);
  assert.equal(summary.totalLiabilities, 400);
  assert.equal(summary.netWorth, -400);
  assert.equal(summary.status, "negative");
});

test("assets minus liabilities calculation", () => {
  assert.equal(calculateNetWorth(2000, 750), 1250);
});

test("negative net worth status", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 100,
      },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: 500,
      },
    ],
    monthKey: "2026-05",
  });
  assert.equal(summary.netWorth, -400);
  assert.equal(summary.status, "negative");
});

test("zero net worth status", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 500,
      },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: 500,
      },
    ],
    monthKey: "2026-05",
  });
  assert.equal(summary.netWorth, 0);
  assert.equal(summary.status, "neutral");
});

test("selected month filtering applies to assets and liabilities", () => {
  const summary = summarizeNetWorthForMonth({
    cashAccounts,
    accountBalanceSnapshots: [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 1000,
      },
      {
        cashAccountId: "cash-1",
        monthKey: "2026-04",
        snapshotDate: "2026-04-01",
        balanceAmount: 9999,
      },
    ],
    liabilityAccounts,
    liabilityBalanceSnapshots: [
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-03",
        balanceAmount: 250,
      },
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-04",
        snapshotDate: "2026-04-03",
        balanceAmount: 8888,
      },
    ],
    monthKey: "2026-05",
  });
  assert.equal(summary.totalAssets, 1000);
  assert.equal(summary.totalLiabilities, 250);
});

test("latest snapshot per account is used in selected month", () => {
  const latest = getLatestSnapshotsForMonth(
    [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 100,
      },
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-20",
        balanceAmount: 300,
      },
    ],
    "2026-05",
    "cashAccountId",
  );
  assert.equal(latest.get("cash-1")?.balanceAmount, 300);
});

test("liability balances are treated as positive owed amounts", () => {
  const liabilities = summarizeLiabilitiesForMonth(
    liabilityAccounts,
    [
      {
        liabilityAccountId: "debt-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-20",
        balanceAmount: -50,
      },
      {
        liabilityAccountId: "debt-2",
        monthKey: "2026-05",
        snapshotDate: "2026-05-21",
        balanceAmount: 80,
      },
    ],
    "2026-05",
  );
  assert.equal(liabilities.totalLiabilities, 80);
});

test("credit card statement balances are not included automatically", () => {
  const assets = summarizeAssetsForMonth(
    cashAccounts,
    [
      {
        cashAccountId: "cash-1",
        monthKey: "2026-05",
        snapshotDate: "2026-05-01",
        balanceAmount: 200,
      },
    ],
    "2026-05",
    [{ statementBalance: 1000 }],
  );
  const liabilities = summarizeLiabilitiesForMonth(liabilityAccounts, [], "2026-05", [
    { statementBalance: 500 },
  ]);
  assert.equal(assets.totalAssets, 200);
  assert.equal(liabilities.totalLiabilities, 0);
});
