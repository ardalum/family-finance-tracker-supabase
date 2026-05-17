import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPaymentDueDateForStatementMonth,
  getStatementCloseDateForStatementMonth,
  getStatementCycleDates,
  getStatementDaysUntilDue,
} from "./statementCycleUtils.js";

describe("statement cycle utils", () => {
  it("uses next month for payment due date", () => {
    const card = { dueDay: 15, statementClosingDay: 30 };
    assert.equal(getStatementCloseDateForStatementMonth("2099-05", card), "2099-05-30");
    assert.equal(getPaymentDueDateForStatementMonth("2099-05", card), "2099-06-15");
  });

  it("uses stored payment due date when present", () => {
    const card = { dueDay: 15, statementClosingDay: 30 };
    const cycle = getStatementCycleDates("2099-05", card, { paymentDueDate: "2099-06-10" });
    assert.equal(cycle.paymentDueDate, "2099-06-10");
  });

  it("falls back to calculated payment due date when stored due date is missing", () => {
    const card = { dueDay: 15, statementClosingDay: 30 };
    const cycle = getStatementCycleDates("2099-05", card, {});
    assert.equal(cycle.paymentDueDate, "2099-06-15");
  });

  it("calculates days until due from payment due date", () => {
    const card = { dueDay: 15 };
    const days = getStatementDaysUntilDue(
      { paymentDueDate: "2099-06-10" },
      "2099-05",
      card,
      new Date("2099-06-08T00:00:00"),
    );
    assert.equal(days, 2);
  });
});
