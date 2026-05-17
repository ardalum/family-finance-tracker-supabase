import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLiabilityAccountOptions,
  calculateLiabilityBalanceTotal,
  getActiveLiabilityAccounts,
  getLatestLiabilitySnapshotByAccount,
  getLiabilitySnapshotsForMonth,
  normalizeLiabilityAccountForm,
  normalizeLiabilitySnapshotForm,
  summarizeLiabilitiesByType,
} from "./liabilitiesService.js";

test("normalizeLiabilityAccountForm applies safe defaults", () => {
  const normalized = normalizeLiabilityAccountForm({ name: " Car Loan " });

  assert.equal(normalized.name, "Car Loan");
  assert.equal(normalized.liabilityType, "other");
  assert.equal(normalized.minimumPayment, 0);
  assert.equal(normalized.dueDay, null);
  assert.equal(normalized.isActive, true);
});

test("normalizeLiabilitySnapshotForm applies safe defaults", () => {
  const normalized = normalizeLiabilitySnapshotForm({
    snapshotDate: "2026-06-12",
    balanceAmount: "55",
  });

  assert.equal(normalized.monthKey, "2026-06");
  assert.equal(normalized.balanceAmount, 55);
});

test("getLiabilitySnapshotsForMonth filters by month", () => {
  const snapshots = [
    { monthKey: "2026-06", id: "a" },
    { monthKey: "2026-05", id: "b" },
  ];
  assert.deepEqual(getLiabilitySnapshotsForMonth(snapshots, "2026-06"), [
    { monthKey: "2026-06", id: "a" },
  ]);
});

test("getLatestLiabilitySnapshotByAccount returns latest per account", () => {
  const snapshots = [
    {
      liabilityAccountId: "l1",
      monthKey: "2026-06",
      snapshotDate: "2026-06-01",
      balanceAmount: 200,
    },
    {
      liabilityAccountId: "l1",
      monthKey: "2026-06",
      snapshotDate: "2026-06-20",
      balanceAmount: 100,
    },
    {
      liabilityAccountId: "l2",
      monthKey: "2026-06",
      snapshotDate: "2026-06-05",
      balanceAmount: 900,
    },
  ];

  const latest = getLatestLiabilitySnapshotByAccount(snapshots, "2026-06");
  assert.equal(latest.get("l1")?.balanceAmount, 100);
  assert.equal(latest.get("l2")?.balanceAmount, 900);
});

test("calculateLiabilityBalanceTotal sums latest account balances", () => {
  const accounts = [{ id: "l1" }, { id: "l2" }];
  const snapshots = [
    {
      liabilityAccountId: "l1",
      monthKey: "2026-06",
      snapshotDate: "2026-06-01",
      balanceAmount: 200,
    },
    {
      liabilityAccountId: "l2",
      monthKey: "2026-06",
      snapshotDate: "2026-06-01",
      balanceAmount: 300,
    },
  ];

  assert.equal(calculateLiabilityBalanceTotal(accounts, snapshots, "2026-06"), 500);
});

test("summarizeLiabilitiesByType groups totals by liability type", () => {
  const accounts = [
    { id: "l1", liabilityType: "credit_card" },
    { id: "l2", liabilityType: "auto_loan" },
    { id: "l3", liabilityType: "credit_card" },
  ];
  const snapshots = [
    {
      liabilityAccountId: "l1",
      monthKey: "2026-06",
      snapshotDate: "2026-06-02",
      balanceAmount: 100,
    },
    {
      liabilityAccountId: "l2",
      monthKey: "2026-06",
      snapshotDate: "2026-06-02",
      balanceAmount: 400,
    },
    {
      liabilityAccountId: "l3",
      monthKey: "2026-06",
      snapshotDate: "2026-06-02",
      balanceAmount: 50,
    },
  ];

  const grouped = summarizeLiabilitiesByType(accounts, snapshots, "2026-06");
  assert.deepEqual(grouped, [
    { type: "auto_loan", amount: 400 },
    { type: "credit_card", amount: 150 },
  ]);
});

test("getActiveLiabilityAccounts excludes inactive accounts", () => {
  const accounts = [
    { id: "a", isActive: true },
    { id: "b", isActive: false },
  ];
  assert.deepEqual(
    getActiveLiabilityAccounts(accounts).map((a) => a.id),
    ["a"],
  );
});

test("buildLiabilityAccountOptions returns active sorted options", () => {
  const options = buildLiabilityAccountOptions([
    { id: "2", name: "Student Loan", isActive: true },
    { id: "1", name: "Credit Card A", isActive: true },
    { id: "3", name: "Closed Loan", isActive: false },
  ]);

  assert.deepEqual(options, [
    { value: "1", label: "Credit Card A" },
    { value: "2", label: "Student Loan" },
  ]);
});

test("invalid and negative amounts are safely normalized", () => {
  const account = normalizeLiabilityAccountForm({ minimumPayment: "bad", interestRate: -2 });
  const snapshotInvalid = normalizeLiabilitySnapshotForm({ balanceAmount: "bad" });
  const snapshotNegative = normalizeLiabilitySnapshotForm({ balanceAmount: -12 });

  assert.equal(account.minimumPayment, 0);
  assert.equal(account.interestRate, 0);
  assert.equal(snapshotInvalid.balanceAmount, 0);
  assert.equal(snapshotNegative.balanceAmount, 0);
});

test("linked credit card metadata does not affect totals automatically", () => {
  const accounts = [{ id: "l1", linkedCreditCardId: "card-1" }];
  const snapshots = [
    {
      liabilityAccountId: "l1",
      monthKey: "2026-06",
      snapshotDate: "2026-06-01",
      balanceAmount: 250,
    },
  ];

  assert.equal(calculateLiabilityBalanceTotal(accounts, snapshots, "2026-06"), 250);
});
