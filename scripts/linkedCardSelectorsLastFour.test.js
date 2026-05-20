import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const recurringFormSource = readFileSync(
  new URL("../src/features/recurring/components/RecurringPaymentForm.jsx", import.meta.url),
  "utf8",
);
const liabilitiesSource = readFileSync(
  new URL("../src/features/liabilities/components/Liabilities.jsx", import.meta.url),
  "utf8",
);
const statementDetailsSource = readFileSync(
  new URL("../src/features/creditCards/components/StatementDetailsEditor.jsx", import.meta.url),
  "utf8",
);
const linkedCardNameSource = readFileSync(
  new URL("../src/components/shared/LinkedCardName.jsx", import.meta.url),
  "utf8",
);
const cardDisplayUtilsSource = readFileSync(
  new URL("../src/features/creditCards/cardDisplayUtils.js", import.meta.url),
  "utf8",
);

test("shared linked card label formatter includes safe last-four handling", () => {
  assert.match(cardDisplayUtilsSource, /formatLinkedCardLabel/);
  assert.match(cardDisplayUtilsSource, /Last 4 missing/);
  assert.match(cardDisplayUtilsSource, /\*\*\*\*/);
});

test("recurring credit card selector uses shared linked card label formatter", () => {
  assert.match(recurringFormSource, /formatLinkedCardLabel/);
  assert.match(recurringFormSource, /\{formatLinkedCardLabel\(card\)\}/);
});

test("liabilities linked card selector and display use shared linked card label formatter", () => {
  assert.match(liabilitiesSource, /formatLinkedCardLabel/);
  assert.match(liabilitiesSource, /Linked card:/);
});

test("statement details card selector uses shared linked card label formatter", () => {
  assert.match(statementDetailsSource, /formatLinkedCardLabel/);
  assert.match(statementDetailsSource, /\{formatLinkedCardLabel\(card\)\}/);
});

test("linked card display component renders formatted label text", () => {
  assert.match(linkedCardNameSource, /formatLinkedCardLabel/);
  assert.match(linkedCardNameSource, /\{label\}/);
});
