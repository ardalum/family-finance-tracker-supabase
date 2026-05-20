import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../creditCards/statementPaymentUtils.js";
import {
  buildRecurringBillMovementPayload,
  buildRecurringPaidDraft,
  getRecurringMovementSourceId,
  RECURRING_PAID_FROM_CREDIT_CARD,
} from "./recurringPaymentFlow.js";

describe("recurring payment flow helpers", () => {
  it("builds recurring movement source id", () => {
    assert.equal(getRecurringMovementSourceId("template-1", "2026-05"), "template-1:2026-05");
  });

  it("builds tracked recurring outflow movement payload", () => {
    const movement = buildRecurringBillMovementPayload({
      template: { id: "rent-1", name: "Rent", dueDay: 1 },
      monthKey: "2026-05",
      amountPaid: 1500,
      paidDate: "2026-05-02",
      paidFromAccount: "checking-1",
    });

    assert.equal(movement.accountId, "checking-1");
    assert.equal(movement.isTracked, true);
    assert.equal(movement.sourceType, "recurring_payment");
    assert.equal(movement.movementType, "recurring_bill_payment");
  });

  it("builds outside/untracked recurring payment movement", () => {
    const movement = buildRecurringBillMovementPayload({
      template: { id: "rent-1", name: "Rent", dueDay: 1 },
      monthKey: "2026-05",
      amountPaid: 1500,
      paidDate: "2026-05-02",
      paidFromAccount: CARD_PAYMENT_OUTSIDE_ACCOUNT,
    });

    assert.equal(movement.accountId, null);
    assert.equal(movement.isTracked, false);
  });

  it("returns null movement for credit card paid-from option", () => {
    const movement = buildRecurringBillMovementPayload({
      template: { id: "rent-1", name: "Rent", dueDay: 1 },
      monthKey: "2026-05",
      amountPaid: 1500,
      paidDate: "2026-05-02",
      paidFromAccount: RECURRING_PAID_FROM_CREDIT_CARD,
    });

    assert.equal(movement, null);
  });

  it("builds draft honoring fixed bill amount", () => {
    const draft = buildRecurringPaidDraft({
      row: {
        template: { billType: "fixed", estimatedAmount: 999, paymentMethod: "Checking Account" },
        instance: {},
      },
      monthKey: "2026-05",
      todayDate: "2026-05-20",
    });

    assert.equal(draft.paidAmount, "999");
    assert.equal(draft.isFixed, true);
  });
});
