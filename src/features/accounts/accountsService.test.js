import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCashAccountOptions,
  calculateAccountBalanceTotal,
  getActiveCashAccounts,
  getLatestSnapshotByAccount,
  getSnapshotsForMonth,
  normalizeAccountBalanceSnapshotForm,
  normalizeCashAccountForm,
  summarizeLiquidCashForMonth,
} from "./accountsService.js";

test("normalizeCashAccountForm applies safe defaults", () => {
  const normalized = normalizeCashAccountForm({ name: " Main Checking " });

  assert.equal(normalized.name, "Main Checking");
  assert.equal(normalized.accountType, "checking");
  assert.equal(normalized.institutionName, "");
  assert.equal(normalized.isActive, true);
});

test("normalizeAccountBalanceSnapshotForm applies safe defaults", () => {
  const normalized = normalizeAccountBalanceSnapshotForm({
    snapshotDate: "2026-05-15",
    balanceAmount: "123.45",
  });

  assert.equal(normalized.monthKey, "2026-05");
  assert.equal(normalized.balanceAmount, 123.45);
});

test("getSnapshotsForMonth filters snapshots by month", () => {
  const snapshots = [
    { monthKey: "2026-05", id: "a" },
    { monthKey: "2026-04", id: "b" },
  ];

  assert.deepEqual(getSnapshotsForMonth(snapshots, "2026-05"), [{ monthKey: "2026-05", id: "a" }]);
});

test("getLatestSnapshotByAccount returns latest snapshot per account", () => {
  const snapshots = [
    { cashAccountId: "acc-1", monthKey: "2026-05", snapshotDate: "2026-05-02", balanceAmount: 50 },
    {
      cashAccountId: "acc-1",
      monthKey: "2026-05",
      snapshotDate: "2026-05-12",
      balanceAmount: 120,
    },
    { cashAccountId: "acc-2", monthKey: "2026-05", snapshotDate: "2026-05-01", balanceAmount: 20 },
  ];

  const latest = getLatestSnapshotByAccount(snapshots, "2026-05");

  assert.equal(latest.get("acc-1")?.balanceAmount, 120);
  assert.equal(latest.get("acc-2")?.balanceAmount, 20);
});

test("summarizeLiquidCashForMonth sums liquid account types including other cash/bank accounts", () => {
  const accounts = [
    { id: "a", accountType: "checking" },
    { id: "b", accountType: "savings" },
    { id: "c", accountType: "other" },
  ];
  const snapshots = [
    { cashAccountId: "a", monthKey: "2026-05", snapshotDate: "2026-05-10", balanceAmount: 100 },
    { cashAccountId: "b", monthKey: "2026-05", snapshotDate: "2026-05-10", balanceAmount: 200 },
    { cashAccountId: "c", monthKey: "2026-05", snapshotDate: "2026-05-10", balanceAmount: 999 },
  ];

  assert.equal(summarizeLiquidCashForMonth(accounts, snapshots, "2026-05"), 1299);
});

test("getActiveCashAccounts excludes inactive accounts", () => {
  const accounts = [
    { id: "a", isActive: true },
    { id: "b", isActive: false },
  ];

  assert.deepEqual(
    getActiveCashAccounts(accounts).map((account) => account.id),
    ["a"],
  );
});

test("buildCashAccountOptions includes only active accounts and sorts", () => {
  const options = buildCashAccountOptions([
    { id: "2", name: "Savings", isActive: true },
    { id: "1", name: "Checking", isActive: true },
    { id: "3", name: "Closed", isActive: false },
  ]);

  assert.deepEqual(options, [
    { value: "1", label: "Checking" },
    { value: "2", label: "Savings" },
  ]);
});

test("calculateAccountBalanceTotal handles negative balances safely", () => {
  const accounts = [{ id: "a", accountType: "checking" }];
  const snapshots = [
    { cashAccountId: "a", monthKey: "2026-05", snapshotDate: "2026-05-10", balanceAmount: -15.5 },
  ];

  assert.equal(calculateAccountBalanceTotal(accounts, snapshots, "2026-05"), -15.5);
});

test("invalid amount values are treated safely as zero", () => {
  const normalized = normalizeAccountBalanceSnapshotForm({
    snapshotDate: "2026-05-10",
    balanceAmount: "oops",
  });

  assert.equal(normalized.balanceAmount, 0);
});

test("empty snapshot data returns zero totals", () => {
  assert.equal(calculateAccountBalanceTotal([], [], "2026-05"), 0);
  assert.equal(summarizeLiquidCashForMonth([], [], "2026-05"), 0);
});
