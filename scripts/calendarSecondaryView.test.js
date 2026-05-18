import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { primaryFinanceViewIds, secondaryViewIds } from "../src/app/secondaryViews.js";

describe("calendar secondary view registration", () => {
  it("registers calendar as a secondary view", () => {
    assert.equal(secondaryViewIds.includes("calendar"), true);
  });

  it("keeps main nav primary views unchanged", () => {
    assert.deepEqual(primaryFinanceViewIds, [
      "dashboard",
      "credit-cards",
      "budgets",
      "spending",
      "recurring",
      "insights",
    ]);
  });
});
