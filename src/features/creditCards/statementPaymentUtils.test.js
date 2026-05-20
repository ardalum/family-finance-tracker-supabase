import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCreditCardPaymentMovementPayload,
  CARD_PAYMENT_OUTSIDE_ACCOUNT,
  getCreditCardPaymentMovementSourceId,
  getStatementPaidAmount,
  getStatementUnpaidAmount,
  isStatementPaid,
} from "./statementPaymentUtils.js";

describe("statement payment utils", () => {
  it("treats zero balance as no unpaid balance", () => {
    assert.equal(getStatementUnpaidAmount({ balance: 0, paid: false }), 0);
    assert.equal(isStatementPaid({ balance: 0, paid: false }), true);
  });

  it("treats paid true as paid", () => {
    assert.equal(isStatementPaid({ balance: 120, paid: true }), true);
    assert.equal(getStatementUnpaidAmount({ balance: 120, paid: true }), 0);
  });

  it("treats paidAmount >= balance as paid", () => {
    assert.equal(isStatementPaid({ balance: 120, paidAmount: 120 }), true);
    assert.equal(isStatementPaid({ balance: 120, paidAmount: 130 }), true);
  });

  it("calculates remaining unpaid amount for partial payments", () => {
    assert.equal(getStatementUnpaidAmount({ balance: 120, paidAmount: 50, paid: false }), 70);
  });

  it("defaults invalid numbers to zero", () => {
    assert.equal(getStatementPaidAmount({ paidAmount: "bad" }), 0);
    assert.equal(getStatementUnpaidAmount({ balance: "bad", paidAmount: "bad" }), 0);
  });

  it("builds credit card payment movement source id", () => {
    assert.equal(getCreditCardPaymentMovementSourceId("card-1", "2026-05"), "card-1:2026-05");
    assert.equal(getCreditCardPaymentMovementSourceId("", "2026-05"), "");
  });

  it("builds tracked card payment movement payload", () => {
    const movement = buildCreditCardPaymentMovementPayload({
      creditCardId: "card-1",
      monthKey: "2026-05",
      paidAmount: 120,
      paidDate: "2026-05-18",
      paymentAccountId: "checking-1",
      cardName: "Travel Card",
    });

    assert.deepEqual(movement, {
      accountId: "checking-1",
      sourceType: "credit_card_payment",
      sourceId: "card-1:2026-05",
      movementType: "credit_card_payment",
      direction: "outflow",
      amount: 120,
      movementDate: "2026-05-18",
      monthKey: "2026-05",
      description: "Card payment: Travel Card",
      isTracked: true,
    });
  });

  it("builds outside/untracked card payment movement payload", () => {
    const movement = buildCreditCardPaymentMovementPayload({
      creditCardId: "card-1",
      monthKey: "2026-05",
      paidAmount: 80,
      paidDate: "",
      paymentAccountId: CARD_PAYMENT_OUTSIDE_ACCOUNT,
    });

    assert.equal(movement.accountId, null);
    assert.equal(movement.isTracked, false);
    assert.equal(movement.movementDate, "2026-05-01");
  });
});
