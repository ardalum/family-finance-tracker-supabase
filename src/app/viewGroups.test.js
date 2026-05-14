import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPrimaryFinanceView, isSecondaryView, secondaryViewIds } from "./secondaryViews.js";

describe("view groups", () => {
  it("keeps the expected utility views", () => {
    assert.deepEqual(secondaryViewIds, [
      "backup",
      "household-settings",
      "app-settings",
      "about",
    ]);
  });

  it("checks utility views", () => {
    assert.equal(isSecondaryView("backup"), true);
    assert.equal(isSecondaryView("household-settings"), true);
    assert.equal(isSecondaryView("dashboard"), false);
  });

  it("checks main finance views", () => {
    assert.equal(isPrimaryFinanceView("dashboard"), true);
    assert.equal(isPrimaryFinanceView("spending"), true);
    assert.equal(isPrimaryFinanceView("about"), false);
  });
});
