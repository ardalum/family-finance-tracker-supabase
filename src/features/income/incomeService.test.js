import assert from "node:assert/strict";
import test from "node:test";

import {
  buildIncomeDepositMovementPayload,
  buildIncomeSourceOptions,
  getActiveIncomeSources,
  getIncomeDepositAccountValue,
  getIncomeEntriesForMonth,
  INCOME_DEPOSIT_OUTSIDE_ACCOUNT,
  normalizeIncomeEntryForm,
  normalizeIncomeSourceForm,
  summarizeIncomeByOwner,
  summarizeIncomeBySource,
  summarizeIncomeForMonth,
} from "./incomeService.js";

test("normalizeIncomeSourceForm applies safe defaults", () => {
  const normalized = normalizeIncomeSourceForm({ name: " Salary " });

  assert.equal(normalized.name, "Salary");
  assert.equal(normalized.sourceType, "paycheck");
  assert.equal(normalized.frequency, "monthly");
  assert.equal(normalized.expectedAmount, 0);
  assert.equal(normalized.isActive, true);
});

test("normalizeIncomeEntryForm applies safe defaults", () => {
  const normalized = normalizeIncomeEntryForm({ entryDate: "2026-05-15", amount: "123.45" });

  assert.equal(normalized.monthKey, "2026-05");
  assert.equal(normalized.entryType, "paycheck");
  assert.equal(normalized.amount, 123.45);
  assert.equal(normalized.depositAccountId, null);
});

test("normalizeIncomeEntryForm keeps tracked deposit account selection", () => {
  const normalized = normalizeIncomeEntryForm({
    entryDate: "2026-05-15",
    amount: "123.45",
    depositAccountId: " checking-1 ",
  });

  assert.equal(normalized.depositAccountId, "checking-1");
});

test("summarizeIncomeForMonth sums only selected month", () => {
  const entries = [
    { monthKey: "2026-05", amount: 100 },
    { monthKey: "2026-05", amount: 150 },
    { monthKey: "2026-04", amount: 300 },
  ];

  assert.equal(summarizeIncomeForMonth(entries, "2026-05"), 250);
});

test("summarizeIncomeBySource groups and sorts descending", () => {
  const sources = [
    { id: "s1", name: "Employer" },
    { id: "s2", name: "Freelance" },
  ];
  const entries = [
    { monthKey: "2026-05", incomeSourceId: "s1", amount: 1000 },
    { monthKey: "2026-05", incomeSourceId: "s2", amount: 300 },
    { monthKey: "2026-05", incomeSourceId: "s1", amount: 200 },
  ];

  const result = summarizeIncomeBySource(entries, sources, "2026-05");

  assert.equal(result[0].label, "Employer");
  assert.equal(result[0].amount, 1200);
  assert.equal(result[1].label, "Freelance");
});

test("summarizeIncomeByOwner groups by profile and household fallback", () => {
  const profiles = [{ id: "p1", displayName: "Alex" }];
  const entries = [
    { monthKey: "2026-05", ownerProfileId: "p1", amount: 800 },
    { monthKey: "2026-05", ownerProfileId: null, amount: 200 },
  ];

  const result = summarizeIncomeByOwner(entries, profiles, "2026-05");

  assert.equal(result[0].label, "Alex");
  assert.equal(result[0].amount, 800);
  assert.equal(result[1].label, "Household");
});

test("getActiveIncomeSources excludes inactive records", () => {
  const sources = [
    { id: "a", isActive: true },
    { id: "b", isActive: false },
  ];

  assert.deepEqual(
    getActiveIncomeSources(sources).map((source) => source.id),
    ["a"],
  );
});

test("buildIncomeSourceOptions only includes active sources and is sorted", () => {
  const options = buildIncomeSourceOptions([
    { id: "2", name: "Salary", isActive: true },
    { id: "1", name: "Bonus", isActive: true },
    { id: "3", name: "Old Job", isActive: false },
  ]);

  assert.deepEqual(options, [
    { value: "1", label: "Bonus" },
    { value: "2", label: "Salary" },
  ]);
});

test("invalid amounts are treated safely as zero", () => {
  const normalizedSource = normalizeIncomeSourceForm({ expectedAmount: "abc" });
  const normalizedEntry = normalizeIncomeEntryForm({ amount: "nope" });

  assert.equal(normalizedSource.expectedAmount, 0);
  assert.equal(normalizedEntry.amount, 0);
});

test("getIncomeEntriesForMonth returns empty array when month is missing", () => {
  assert.deepEqual(getIncomeEntriesForMonth([{ monthKey: "2026-01" }]), []);
});

test("buildIncomeDepositMovementPayload creates tracked inflow movement", () => {
  const movement = buildIncomeDepositMovementPayload(
    {
      supabaseId: "income-1",
      amount: 3000,
      entryDate: "2026-05-17",
      monthKey: "2026-05",
      entryType: "paycheck",
    },
    "checking-1",
  );

  assert.deepEqual(movement, {
    accountId: "checking-1",
    sourceType: "income_entry",
    sourceId: "income-1",
    movementType: "income_deposit",
    direction: "inflow",
    amount: 3000,
    movementDate: "2026-05-17",
    monthKey: "2026-05",
    description: "Income deposit: paycheck",
    isTracked: true,
  });
});

test("buildIncomeDepositMovementPayload creates untracked movement for outside deposits", () => {
  const movement = buildIncomeDepositMovementPayload(
    {
      id: "income-2",
      amount: 500,
      entryDate: "2026-05-18",
      entryType: "bonus",
    },
    INCOME_DEPOSIT_OUTSIDE_ACCOUNT,
  );

  assert.equal(movement.accountId, null);
  assert.equal(movement.sourceId, "income-2");
  assert.equal(movement.amount, 500);
  assert.equal(movement.monthKey, "2026-05");
  assert.equal(movement.isTracked, false);
});

test("buildIncomeDepositMovementPayload returns null for legacy entries without deposit account", () => {
  assert.equal(
    buildIncomeDepositMovementPayload(
      {
        id: "income-3",
        amount: 100,
        entryDate: "2026-05-19",
      },
      "",
    ),
    null,
  );
});

test("getIncomeDepositAccountValue returns tracked account, outside option, or empty legacy value", () => {
  const entry = { id: "income-1" };
  const trackedMovement = {
    sourceType: "income_entry",
    sourceId: "income-1",
    accountId: "checking-1",
    isTracked: true,
  };
  const untrackedMovement = {
    sourceType: "income_entry",
    sourceId: "income-1",
    accountId: null,
    isTracked: false,
  };

  assert.equal(getIncomeDepositAccountValue(entry, [trackedMovement]), "checking-1");
  assert.equal(
    getIncomeDepositAccountValue(entry, [untrackedMovement]),
    INCOME_DEPOSIT_OUTSIDE_ACCOUNT,
  );
  assert.equal(getIncomeDepositAccountValue({ id: "income-legacy" }, [trackedMovement]), "");
});
