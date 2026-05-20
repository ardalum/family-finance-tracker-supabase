import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const creditCardFormSource = readFileSync(
  new URL("../src/features/creditCards/components/CreditCardForm.jsx", import.meta.url),
  "utf8",
);
const recurringFormSource = readFileSync(
  new URL("../src/features/recurring/components/RecurringPaymentForm.jsx", import.meta.url),
  "utf8",
);

test("credit card autopay requires selecting a real source account", () => {
  assert.match(creditCardFormSource, /Autopay paid from account/);
  assert.match(creditCardFormSource, /Outside \/ untracked account/);
  assert.match(
    creditCardFormSource,
    /Choose the account autopay uses, or select Outside \/ untracked\./,
  );
});

test("recurring bill autopay requires paid-from account for cash\/bank methods", () => {
  assert.match(
    recurringFormSource,
    /label=\{form\.autopayEnabled \? "Autopay paid from account" : "Paid from account"\}/,
  );
  assert.match(recurringFormSource, /isRecurringCashBankPaymentMethod\(form\.paymentMethod\)/);
  assert.match(
    recurringFormSource,
    /Choose the account autopay uses, or select Outside \/ untracked\./,
  );
});

test("recurring credit-card payment method still requires linked card selection", () => {
  assert.match(recurringFormSource, /label="Credit card used"/);
  assert.match(recurringFormSource, /Select a valid credit card\./);
});
