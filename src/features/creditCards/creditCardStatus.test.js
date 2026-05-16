import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getRowStatus } from "./creditCardStatus.js";

const card = {
  dueDay: 20,
};

describe("credit card status", () => {
  it("marks missing monthly balance entries as not checked", () => {
    const status = getRowStatus(card, "2099-05", undefined);

    assert.equal(status.label, "Not checked");
    assert.equal(status.isNotChecked, true);
    assert.equal(status.isCheckedNoBalance, false);
    assert.equal(status.isNoBalance, false);
  });

  it("marks saved zero balance entries as checked with no balance", () => {
    const status = getRowStatus(card, "2099-05", { balance: 0, paid: true });

    assert.equal(status.label, "Checked · No balance");
    assert.equal(status.isNotChecked, false);
    assert.equal(status.isCheckedNoBalance, true);
    assert.equal(status.isNoBalance, true);
  });

  it("marks positive paid balances as paid", () => {
    const status = getRowStatus(card, "2099-05", { balance: 100, paid: true });

    assert.equal(status.label, "Paid");
  });
});
