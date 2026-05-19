import assert from "node:assert/strict";
import test from "node:test";

import {
  applyProjectedMovementsToAccountRows,
  calculateProjectedMovementTotal,
  deleteMovementBySource,
  findMovementBySource,
  getMoneyMovementSignedAmount,
  getMoneyMovementSourceKey,
  getTrackedMovementsForMonth,
  normalizeMoneyMovementForm,
  replaceMovementBySource,
  summarizeProjectedMovementsByAccount,
} from "./accountMoneyMovementsService.js";

const trackedInflow = {
  accountId: "checking",
  sourceType: "income_entry",
  sourceId: "income-1",
  movementType: "income_deposit",
  direction: "inflow",
  amount: 3000,
  movementDate: "2026-05-10",
  monthKey: "2026-05",
  isTracked: true,
};

const trackedOutflow = {
  accountId: "checking",
  sourceType: "recurring_payment",
  sourceId: "rent-1",
  movementType: "recurring_bill_payment",
  direction: "outflow",
  amount: 1500,
  movementDate: "2026-05-12",
  monthKey: "2026-05",
  isTracked: true,
};

const outsideMovement = {
  accountId: null,
  sourceType: "spending_transaction",
  sourceId: "spend-1",
  movementType: "spending_payment",
  direction: "outflow",
  amount: 50,
  movementDate: "2026-05-12",
  monthKey: "2026-05",
  isTracked: false,
};

test("normalizeMoneyMovementForm normalizes valid tracked movement input", () => {
  const normalized = normalizeMoneyMovementForm({
    accountId: " checking ",
    sourceType: "income_entry",
    sourceId: " income-1 ",
    movementType: "income_deposit",
    direction: "inflow",
    amount: "123.45",
    movementDate: "2026-05-15",
    description: " Paycheck ",
  });

  assert.equal(normalized.accountId, "checking");
  assert.equal(normalized.sourceId, "income-1");
  assert.equal(normalized.amount, 123.45);
  assert.equal(normalized.monthKey, "2026-05");
  assert.equal(normalized.description, "Paycheck");
  assert.equal(normalized.isTracked, true);
});

test("normalizeMoneyMovementForm allows outside/untracked movement without an account", () => {
  const normalized = normalizeMoneyMovementForm({
    sourceType: "spending_transaction",
    sourceId: "spend-1",
    movementType: "spending_payment",
    direction: "outflow",
    amount: 25,
    movementDate: "2026-05-15",
    isTracked: false,
  });

  assert.equal(normalized.accountId, null);
  assert.equal(normalized.isTracked, false);
});

test("normalizeMoneyMovementForm rejects tracked movements without an account", () => {
  assert.throws(
    () =>
      normalizeMoneyMovementForm({
        sourceType: "income_entry",
        movementType: "income_deposit",
        direction: "inflow",
        amount: 10,
        isTracked: true,
      }),
    /require an account/,
  );
});

test("normalizeMoneyMovementForm rejects invalid movement values", () => {
  assert.throws(
    () =>
      normalizeMoneyMovementForm({
        accountId: "checking",
        sourceType: "income_entry",
        movementType: "income_deposit",
        direction: "sideways",
        amount: 10,
      }),
    /direction must be one of/,
  );
});

test("getMoneyMovementSignedAmount returns positive inflows and negative outflows", () => {
  assert.equal(getMoneyMovementSignedAmount(trackedInflow), 3000);
  assert.equal(getMoneyMovementSignedAmount(trackedOutflow), -1500);
  assert.equal(getMoneyMovementSignedAmount(outsideMovement), 0);
});

test("getMoneyMovementSourceKey builds dedupe key only when source is present", () => {
  assert.equal(getMoneyMovementSourceKey(trackedInflow), "income_entry:income-1");
  assert.equal(getMoneyMovementSourceKey({ sourceType: "income_entry" }), "");
});

test("replaceMovementBySource replaces an existing source movement", () => {
  const movements = [trackedInflow, trackedOutflow];
  const replacement = {
    ...trackedInflow,
    amount: 3500,
    description: "Updated paycheck",
  };

  const result = replaceMovementBySource(movements, replacement);

  assert.equal(result.length, 2);
  assert.equal(findMovementBySource(result, "income_entry", "income-1")?.amount, 3500);
  assert.equal(findMovementBySource(result, "recurring_payment", "rent-1")?.amount, 1500);
});

test("deleteMovementBySource removes only the matching source movement", () => {
  const result = deleteMovementBySource(
    [trackedInflow, trackedOutflow],
    "recurring_payment",
    "rent-1",
  );

  assert.deepEqual(result, [trackedInflow]);
});

test("getTrackedMovementsForMonth ignores outside movements and other months", () => {
  const result = getTrackedMovementsForMonth(
    [trackedInflow, trackedOutflow, outsideMovement, { ...trackedInflow, monthKey: "2026-04" }],
    "2026-05",
  );

  assert.deepEqual(result, [trackedInflow, trackedOutflow]);
});

test("calculateProjectedMovementTotal aggregates tracked account movements", () => {
  const movements = [
    trackedInflow,
    trackedOutflow,
    outsideMovement,
    {
      ...trackedOutflow,
      sourceId: "card-payment-1",
      sourceType: "credit_card_payment",
      movementType: "credit_card_payment",
      amount: 250,
    },
    {
      ...trackedOutflow,
      accountId: "savings",
      sourceId: "savings-payment-1",
      amount: 75,
    },
  ];

  assert.equal(
    calculateProjectedMovementTotal(movements, { accountId: "checking", monthKey: "2026-05" }),
    1250,
  );
  assert.equal(calculateProjectedMovementTotal(movements, { monthKey: "2026-05" }), 1175);
});

test("summarizeProjectedMovementsByAccount returns totals by account", () => {
  const summary = summarizeProjectedMovementsByAccount(
    [trackedInflow, trackedOutflow, { ...trackedInflow, accountId: "savings", amount: 200 }],
    "2026-05",
  );

  assert.equal(summary.get("checking"), 1500);
  assert.equal(summary.get("savings"), 200);
});

test("applyProjectedMovementsToAccountRows adds projected movement totals without changing snapshots", () => {
  const rows = [
    {
      account: { id: "checking" },
      latestBalanceAmount: 4000,
    },
    {
      account: { id: "savings" },
      latestBalanceAmount: 1000,
    },
  ];

  const result = applyProjectedMovementsToAccountRows(
    rows,
    [trackedInflow, trackedOutflow, { ...trackedInflow, accountId: "savings", amount: 200 }],
    "2026-05",
  );

  assert.equal(result[0].latestBalanceAmount, 4000);
  assert.equal(result[0].projectedMovementTotal, 1500);
  assert.equal(result[0].projectedBalanceAmount, 5500);
  assert.equal(result[1].projectedMovementTotal, 200);
  assert.equal(result[1].projectedBalanceAmount, 1200);
});
