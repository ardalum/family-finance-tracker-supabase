import assert from "node:assert/strict";
import test from "node:test";

import { formatLinkedCardLabel } from "./cardDisplayUtils.js";

test("formatLinkedCardLabel includes network and last four when available", () => {
  assert.equal(
    formatLinkedCardLabel({ name: "Chase Freedom", network: "Visa", lastFour: "1234" }),
    "Chase Freedom • Visa **** 1234",
  );
});

test("formatLinkedCardLabel omits network when unavailable", () => {
  assert.equal(
    formatLinkedCardLabel({ name: "Chase Freedom", network: "", lastFour: "1234" }),
    "Chase Freedom • **** 1234",
  );
});

test("formatLinkedCardLabel handles missing last four safely", () => {
  assert.equal(formatLinkedCardLabel({ name: "Chase Freedom" }), "Chase Freedom");
  assert.equal(
    formatLinkedCardLabel({ name: "Chase Freedom" }, { showMissingLastFour: true }),
    "Chase Freedom • Last 4 missing",
  );
});
