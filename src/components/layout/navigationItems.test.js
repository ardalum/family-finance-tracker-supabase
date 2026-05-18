import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { primaryFinanceViewIds } from "../../app/secondaryViews.js";
import {
  createInitialExpandedGroupState,
  getNavigationItemIds,
  getSectionIdByView,
  groupedNavigationSections,
  navItems,
} from "./navigationItems.js";

describe("navigation items", () => {
  it("keeps navigation item ids aligned with the primary finance view order", () => {
    assert.deepEqual(getNavigationItemIds(), primaryFinanceViewIds);
  });

  it("keeps primary navigation labels concise", () => {
    assert.deepEqual(
      navItems.map((item) => item.label),
      ["Dashboard", "Cards", "Budget", "Spending", "Bills", "Insights"],
    );
  });

  it("keeps every navigation item renderable", () => {
    for (const item of navItems) {
      assert.equal(typeof item.id, "string");
      assert.equal(typeof item.label, "string");
      assert.equal(typeof item.shortLabel, "string");
      assert.ok(["function", "object"].includes(typeof item.icon));
    }
  });

  it("does not include duplicate navigation item ids", () => {
    const ids = getNavigationItemIds();

    assert.equal(new Set(ids).size, ids.length);
  });

  it("exposes grouped sidebar sections including Money Setup", () => {
    assert.deepEqual(
      groupedNavigationSections.map((section) => section.label),
      ["Main", "Planning", "Money Setup", "System"],
    );

    const moneySetup = groupedNavigationSections.find((section) => section.id === "money-setup");
    assert.ok(moneySetup);
    assert.deepEqual(
      moneySetup.items.map((item) => item.id),
      ["income", "savings", "accounts", "liabilities"],
    );
  });

  it("maps views to grouped section ids", () => {
    assert.equal(getSectionIdByView("income"), "money-setup");
    assert.equal(getSectionIdByView("calendar"), "planning");
    assert.equal(getSectionIdByView("backup"), "system");
  });

  it("uses default collapsed/expanded group state with active-section auto-expand", () => {
    const baseState = createInitialExpandedGroupState();
    assert.equal(baseState.main, true);
    assert.equal(baseState.planning, false);
    assert.equal(baseState["money-setup"], false);
    assert.equal(baseState.system, false);

    const incomeState = createInitialExpandedGroupState("income");
    assert.equal(incomeState["money-setup"], true);

    const calendarState = createInitialExpandedGroupState("calendar");
    assert.equal(calendarState.planning, true);

    const systemState = createInitialExpandedGroupState("backup");
    assert.equal(systemState.system, true);
  });
});
