import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SELECTED_MONTH_KEYS, createInitialSelectedMonths } from "./selectedMonthUtils.js";

describe("selected month utilities", () => {
  it("defines the app selected month keys", () => {
    assert.deepEqual(SELECTED_MONTH_KEYS, [
      "balance",
      "budget",
      "spending",
      "dashboard",
      "insights",
      "recurring",
    ]);
  });

  it("creates initial selected months with the provided month key", () => {
    assert.deepEqual(createInitialSelectedMonths("2026-05"), {
      balance: "2026-05",
      budget: "2026-05",
      spending: "2026-05",
      dashboard: "2026-05",
      insights: "2026-05",
      recurring: "2026-05",
    });
  });
});
