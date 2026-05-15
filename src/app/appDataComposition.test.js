import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createDashboardAppData, createInsightsAppData } from "./appDataComposition.js";

const baseData = {
  budgetsByMonth: {
    previous: [{ id: "old" }],
  },
};

const input = {
  appData: baseData,
  creditCards: [{ id: "card" }],
  monthlyBalances: { current: {} },
  selectedMonth: "current",
  budgets: [{ id: "budget" }],
  transactions: [{ id: "transaction" }],
  recurringPayments: [{ id: "recurring" }],
  recurringStatusByMonth: { current: {} },
};

describe("app data composition", () => {
  it("creates dashboard data for the selected month", () => {
    const result = createDashboardAppData(input);

    assert.equal(result.creditCards, input.creditCards);
    assert.equal(result.monthlyBalances, input.monthlyBalances);
    assert.equal(result.budgetsByMonth.previous, baseData.budgetsByMonth.previous);
    assert.equal(result.budgetsByMonth.current, input.budgets);
    assert.equal(result.transactions, input.transactions);
    assert.equal(result.recurringPayments, input.recurringPayments);
    assert.equal(result.recurringStatusByMonth, input.recurringStatusByMonth);
    assert.equal(result.recurringTransactions, input.transactions);
  });

  it("creates insights data for the selected month", () => {
    const result = createInsightsAppData(input);

    assert.equal(result.creditCards, input.creditCards);
    assert.equal(result.monthlyBalances, input.monthlyBalances);
    assert.equal(result.budgetsByMonth.previous, baseData.budgetsByMonth.previous);
    assert.equal(result.budgetsByMonth.current, input.budgets);
    assert.equal(result.transactions, input.transactions);
    assert.equal(result.recurringPayments, input.recurringPayments);
    assert.equal(result.recurringStatusByMonth, input.recurringStatusByMonth);
    assert.equal(result.recurringTransactions, input.transactions);
  });

  it("handles missing base data", () => {
    const result = createDashboardAppData({
      selectedMonth: "current",
      budgets: [],
      transactions: [],
    });

    assert.deepEqual(result.budgetsByMonth, { current: [] });
    assert.deepEqual(result.transactions, []);
    assert.deepEqual(result.recurringTransactions, []);
  });
});
