import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const recurringFormSource = readFileSync(
  new URL("../src/features/recurring/components/RecurringPaymentForm.jsx", import.meta.url),
  "utf8",
);
const recurringTableSource = readFileSync(
  new URL("../src/features/recurring/components/RecurringPaymentTable.jsx", import.meta.url),
  "utf8",
);

test("recurring template form includes optional bill portal url field", () => {
  assert.match(recurringFormSource, /label="Bill portal URL"/);
  assert.match(recurringFormSource, /placeholder="https:\/\/www\.duke-energy\.com"/);
});

test("recurring template form validates portal url protocol when provided", () => {
  assert.match(recurringFormSource, /Bill portal URL must start with http or https\./);
  assert.match(recurringFormSource, /Enter a valid Bill portal URL that starts with https:\/\//);
});

test("recurring template table shows portal link only when url exists", () => {
  assert.match(recurringTableSource, /template\.portalUrl \? \(/);
  assert.match(recurringTableSource, /href=\{template\.portalUrl\}/);
  assert.match(recurringTableSource, /target="_blank"/);
  assert.match(recurringTableSource, /rel="noreferrer"/);
  assert.match(recurringTableSource, /Open portal/);
});
