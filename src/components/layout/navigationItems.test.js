import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { primaryFinanceViewIds } from "../../app/secondaryViews.js";
import { getNavigationItemIds, navItems } from "./navigationItems.js";

describe("navigation items", () => {
  it("keeps navigation item ids aligned with the primary finance view order", () => {
    assert.deepEqual(getNavigationItemIds(), primaryFinanceViewIds);
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
});