import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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
});
