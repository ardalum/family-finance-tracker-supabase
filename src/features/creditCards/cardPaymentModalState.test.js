import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCardPaymentDraft,
  buildPaidEntryFromDraft,
  shouldOpenCardPaymentModal,
} from "./cardPaymentModalState.js";

describe("card payment modal state", () => {
  it("opens modal only when marking positive balance as paid", () => {
    assert.equal(shouldOpenCardPaymentModal({ balance: 50 }, true), true);
    assert.equal(shouldOpenCardPaymentModal({ balance: 0 }, true), false);
    assert.equal(shouldOpenCardPaymentModal({ balance: 50 }, false), false);
  });

  it("builds payment draft with unpaid amount and existing paid date", () => {
    const draft = buildCardPaymentDraft(
      {
        balance: 120,
        paidAmount: 20,
        paidDate: "2026-05-20",
        paymentAccountId: "checking-1",
      },
      { id: "card-1", name: "Main Card", lastFour: "1234" },
    );

    assert.equal(draft.paidAmount, "100");
    assert.equal(draft.paidDate, "2026-05-20");
    assert.equal(draft.paymentAccountId, "checking-1");
    assert.equal(draft.statementBalance, 120);
    assert.equal(draft.unpaidBalance, 100);
  });

  it("builds paid entry from modal draft", () => {
    const entry = buildPaidEntryFromDraft(
      { balance: 75, paid: false },
      { paidAmount: "75", paidDate: "2026-05-21", paymentAccountId: "outside_untracked" },
    );

    assert.equal(entry.paid, true);
    assert.equal(entry.paidAmount, 75);
    assert.equal(entry.paidDate, "2026-05-21");
    assert.equal(entry.paymentAccountId, "outside_untracked");
  });
});
