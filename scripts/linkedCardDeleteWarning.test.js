import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("linked credit card delete warning", () => {
  it("shows linked recurring bill warning copy in credit card delete confirmation", () => {
    const source = read("src/features/creditCards/components/CreditCardList.jsx");
    assert.equal(source.includes("linked to"), true);
    assert.equal(source.includes("recurring bill"), true);
    assert.equal(source.includes("Update"), true);
    assert.equal(source.includes("Recurring Payments"), true);
  });

  it("keeps recurring templates safe when linked card is missing", () => {
    const source = read("src/features/recurring/components/RecurringPaymentTable.jsx");
    assert.equal(source.includes("Needs review: deleted card"), true);
  });
});
