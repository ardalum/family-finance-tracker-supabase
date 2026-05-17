import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { SELECTED_MONTH_KEYS, createInitialSelectedMonths } from "./selectedMonthUtils.js";

const expectedSelectedMonthKeys = [
  "balance",
  "budget",
  "spending",
  "dashboard",
  "insights",
  "financialPosition",
  "recurring",
  "income",
  "savings",
  "accounts",
  "liabilities",
  "netWorth",
];

describe("selected month utilities", () => {
  it("defines the app selected month keys", () => {
    assert.deepEqual(SELECTED_MONTH_KEYS, expectedSelectedMonthKeys);
  });

  it("creates initial selected months with the provided month key", () => {
    assert.deepEqual(createInitialSelectedMonths("2026-05"), {
      balance: "2026-05",
      budget: "2026-05",
      spending: "2026-05",
      dashboard: "2026-05",
      insights: "2026-05",
      financialPosition: "2026-05",
      recurring: "2026-05",
      income: "2026-05",
      savings: "2026-05",
      accounts: "2026-05",
      liabilities: "2026-05",
      netWorth: "2026-05",
    });
  });

  it("creates an object with exactly the selected month keys", () => {
    const selectedMonths = createInitialSelectedMonths("2026-05");

    assert.deepEqual(Object.keys(selectedMonths), expectedSelectedMonthKeys);
  });

  it("assigns the provided month key to every selected month entry", () => {
    const selectedMonths = createInitialSelectedMonths("2099-12");

    for (const key of SELECTED_MONTH_KEYS) {
      assert.equal(selectedMonths[key], "2099-12");
    }
  });

  it("creates a fresh selected month object each time", () => {
    const firstSelectedMonths = createInitialSelectedMonths("2026-05");
    const secondSelectedMonths = createInitialSelectedMonths("2026-05");

    assert.notEqual(firstSelectedMonths, secondSelectedMonths);
    assert.deepEqual(firstSelectedMonths, secondSelectedMonths);
  });
});
