import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { primaryFinanceViewIds } from "../../app/secondaryViews.js";
import {
  createInitialExpandedGroupState,
  dashboardV2SidebarItems,
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
      ["Overview", "Cards & Debt", "Budgets", "Transactions", "Bills", "Insights"],
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
      ["MAIN", "PLANNING", "MONEY SETUP", "SYSTEM"],
    );

    const moneySetup = groupedNavigationSections.find((section) => section.id === "money-setup");
    assert.ok(moneySetup);
    assert.deepEqual(
      moneySetup.items.map((item) => item.id),
      ["income", "accounts", "liabilities"],
    );
  });

  it("maps views to grouped section ids", () => {
    assert.equal(getSectionIdByView("income"), "money-setup");
    assert.equal(getSectionIdByView("calendar"), "planning");
    assert.equal(getSectionIdByView("app-settings"), "system");
    assert.equal(getSectionIdByView("backup"), null);
  });

  it("shows Money Center in the V2 sidebar and keeps income/accounts as hidden aliases", () => {
    const labels = dashboardV2SidebarItems.map((item) => item.label);
    assert.equal(labels.includes("Money Center"), true);
    assert.equal(labels.includes("Income"), false);
    assert.equal(labels.includes("Accounts"), false);
    assert.equal(labels.includes("Help Center"), false);
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
    assert.equal(systemState.system, false);

    const appSettingsState = createInitialExpandedGroupState("app-settings");
    assert.equal(appSettingsState.system, true);
  });
});
