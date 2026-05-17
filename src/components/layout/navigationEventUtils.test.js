import assert from "node:assert/strict";
import test from "node:test";

import { shouldHandleNavigationView } from "./navigationEventUtils.js";

test("navigation handler accepts primary views", () => {
  assert.equal(shouldHandleNavigationView("dashboard"), true);
  assert.equal(shouldHandleNavigationView("spending"), true);
});

test("navigation handler accepts secondary income view", () => {
  assert.equal(shouldHandleNavigationView("income"), true);
});

test("navigation handler ignores unknown views", () => {
  assert.equal(shouldHandleNavigationView("not-a-real-view"), false);
  assert.equal(shouldHandleNavigationView(""), false);
});
