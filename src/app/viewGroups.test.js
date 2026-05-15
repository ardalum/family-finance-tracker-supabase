import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appViewGroups,
  isKnownGroupedView,
  isKnownUngroupedView,
  isPrimaryFinanceView,
  isSecondaryView,
  primaryFinanceViewIds,
  secondaryViewIds,
} from "./secondaryViews.js";

describe("view groups", () => {
  it("keeps the expected main finance views", () => {
    assert.deepEqual(primaryFinanceViewIds, [
      "dashboard",
      "credit-cards",
      "budgets",
      "spending",
      "recurring",
      "insights",
    ]);
  });

  it("keeps the expected utility views", () => {
    assert.deepEqual(secondaryViewIds, ["backup", "household-settings", "app-settings", "about"]);
  });

  it("groups main and utility views", () => {
    assert.deepEqual(appViewGroups, {
      primary: primaryFinanceViewIds,
      secondary: secondaryViewIds,
    });
  });

  it("checks utility views", () => {
    assert.equal(isSecondaryView("backup"), true);
    assert.equal(isSecondaryView("household-settings"), true);
    assert.equal(isSecondaryView("dashboard"), false);
    assert.equal(isSecondaryView("missing-view"), false);
  });

  it("checks main finance views", () => {
    assert.equal(isPrimaryFinanceView("dashboard"), true);
    assert.equal(isPrimaryFinanceView("spending"), true);
    assert.equal(isPrimaryFinanceView("about"), false);
    assert.equal(isPrimaryFinanceView("missing-view"), false);
  });

  it("checks known grouped views", () => {
    assert.equal(isKnownGroupedView("dashboard"), true);
    assert.equal(isKnownGroupedView("about"), true);
    assert.equal(isKnownGroupedView("missing-view"), false);
  });

  it("checks known views that are not in a group", () => {
    assert.equal(isKnownUngroupedView("dashboard"), false);
    assert.equal(isKnownUngroupedView("about"), false);
    assert.equal(isKnownUngroupedView("missing-view"), false);
  });
});
