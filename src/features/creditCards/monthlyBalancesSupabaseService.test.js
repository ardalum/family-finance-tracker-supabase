import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeMonthlyBalancePatchForPersist,
  toLoadedMonthBalanceEntry,
} from "./monthlyBalancePersistence.js";
import {
  getStatementMovementSourceIds,
  resolveCardPaymentMovementAction,
} from "./monthlyBalanceMovementService.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "./statementPaymentUtils.js";

describe("monthly balances supabase service helpers", () => {
  it("keeps zero-balance unpaid rows as not checked inputs", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 0, paid: false, updated_at: "2026-05-17T00:00:00.000Z" },
      null,
    );

    assert.equal(entry.paid, false);
    assert.equal(entry.rawPaid, false);
    assert.equal(entry.checkedNoBalance, false);
  });

  it("keeps zero-balance paid rows as explicit checked-no-balance", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 0, paid: true, updated_at: "2026-05-17T00:00:00.000Z" },
      null,
    );

    assert.equal(entry.paid, true);
    assert.equal(entry.rawPaid, true);
    assert.equal(entry.checkedNoBalance, true);
  });

  it("keeps positive balances statement-paid when paid amount covers the balance", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 120, paid: false, updated_at: "2026-05-17T00:00:00.000Z" },
      { paid_amount: 120 },
    );

    assert.equal(entry.paid, true);
    assert.equal(entry.checkedNoBalance, false);
  });

  it("normalizes zero-balance unpaid patches to delete instead of implicit paid save", () => {
    const patch = normalizeMonthlyBalancePatchForPersist({ balance: 0, paid: false });

    assert.equal(patch.shouldDelete, true);
    assert.equal(patch.explicitNoBalance, false);
  });

  it("normalizes explicit no-balance patch to saved checked marker", () => {
    const patch = normalizeMonthlyBalancePatchForPersist({ balance: 0, paid: true });

    assert.equal(patch.shouldDelete, false);
    assert.equal(patch.explicitNoBalance, true);
    assert.equal(patch.balance, 0);
    assert.equal(patch.paid, true);
  });

  it("builds upsert movement action for tracked paid card payments", () => {
    const result = resolveCardPaymentMovementAction({
      householdId: "household-1",
      monthKey: "2026-05",
      card: { id: "local-card", supabaseId: "card-supa-1", name: "Main Card" },
      patch: {
        balance: 500,
        paid: true,
        paidAmount: 200,
        paidDate: "2026-05-20",
        paymentAccountId: "checking-1",
      },
    });

    assert.equal(result.action, "upsert");
    assert.equal(result.sourceId, "card-supa-1:2026-05");
    assert.equal(result.payload.accountId, "checking-1");
    assert.equal(result.payload.amount, 200);
    assert.equal(result.payload.isTracked, true);
  });

  it("builds outside/untracked movement action for outside card payments", () => {
    const result = resolveCardPaymentMovementAction({
      householdId: "household-1",
      monthKey: "2026-05",
      card: { id: "card-1", name: "Travel Card" },
      patch: {
        balance: 400,
        paid: true,
        paidAmount: 150,
        paymentAccountId: CARD_PAYMENT_OUTSIDE_ACCOUNT,
      },
    });

    assert.equal(result.action, "upsert");
    assert.equal(result.payload.accountId, null);
    assert.equal(result.payload.isTracked, false);
  });

  it("builds delete movement action for unpaid or reversed entries", () => {
    const result = resolveCardPaymentMovementAction({
      householdId: "household-1",
      monthKey: "2026-05",
      card: { id: "card-1", supabaseId: "card-supa-1" },
      patch: {
        balance: 400,
        paid: false,
        paidAmount: 0,
        paymentAccountId: "checking-1",
      },
    });

    assert.equal(result.action, "delete");
    assert.equal(result.sourceId, "card-supa-1:2026-05");
  });

  it("builds statement movement source ids for lookup across payment months", () => {
    const sourceIds = getStatementMovementSourceIds([
      { credit_card_id: "card-1", month_key: "2026-04" },
      { credit_card_id: "card-2", month_key: "2026-04" },
      { credit_card_id: "card-1", month_key: "2026-04" },
    ]);

    assert.deepEqual(sourceIds, ["card-1:2026-04", "card-2:2026-04"]);
  });
});
