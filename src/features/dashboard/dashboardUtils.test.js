import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAlerts } from "./dashboardUtils.js";

function createDashboardData(overrides = {}) {
  return {
    budgetRows: [],
    cardRows: [],
    recurringRows: [],
    summary: {
      budgetTotal: 0,
      spendingTotal: 0,
    },
    ...overrides,
  };
}

describe("dashboard alerts", () => {
  it("creates danger alerts for over-budget categories", () => {
    const alerts = getAlerts(
      createDashboardData({
        budgetRows: [
          {
            category: "Groceries",
            remaining: -25,
            percentUsed: 125,
          },
        ],
      }),
    );

    assert.deepEqual(alerts, [
      {
        type: "danger",
        category: "Budgets",
        text: "Groceries is over budget by 25.00.",
      },
    ]);
  });

  it("creates warning alerts for categories near their budget limit", () => {
    const alerts = getAlerts(
      createDashboardData({
        budgetRows: [
          {
            category: "Dining",
            remaining: 10,
            percentUsed: 95,
          },
        ],
      }),
    );

    assert.deepEqual(alerts, [
      {
        type: "warning",
        category: "Budgets",
        text: "Dining has used 95% of its budget.",
      },
    ]);
  });

  it("creates card alerts for due and partial payment states", () => {
    const alerts = getAlerts(
      createDashboardData({
        cardRows: [
          {
            card: { name: "Test Card" },
            hasPaymentDue: true,
            daysUntilDue: 3,
            balance: 200,
            paid: false,
            minimumPayment: 50,
            paidAmount: 25,
            autopayEnabled: true,
            autopayDate: "",
          },
        ],
      }),
    );

    assert.deepEqual(alerts, [
      {
        type: "warning",
        category: "Credit Card Statements",
        text: "Test Card is due within 7 days.",
      },
      {
        type: "danger",
        category: "Credit Card Statements",
        text: "Test Card has not met the minimum payment of 50.00.",
      },
      {
        type: "warning",
        category: "Credit Card Statements",
        text: "Test Card has a partial payment of 25.00 on a 200.00 statement.",
      },
      {
        type: "warning",
        category: "Credit Card Statements",
        text: "Test Card has autopay enabled but no autopay date.",
      },
    ]);
  });

  it("creates recurring payment alerts", () => {
    const alerts = getAlerts(
      createDashboardData({
        recurringRows: [
          {
            displayStatus: "Past due",
            template: { name: "Rent", billType: "fixed" },
          },
          {
            displayStatus: "Due soon",
            template: { name: "Electric", billType: "variable" },
            instance: null,
          },
        ],
      }),
    );

    assert.deepEqual(alerts, [
      {
        type: "danger",
        category: "Recurring Payments",
        text: "Rent is past due and unpaid.",
      },
      {
        type: "warning",
        category: "Recurring Payments",
        text: "Electric is due within 7 days and unpaid.",
      },
      {
        type: "warning",
        category: "Data Cleanup",
        text: "Electric needs an actual variable amount.",
      },
    ]);
  });

  it("creates a danger alert when total spending is higher than total budget", () => {
    const alerts = getAlerts(
      createDashboardData({
        summary: {
          budgetTotal: 100,
          spendingTotal: 125,
        },
      }),
    );

    assert.deepEqual(alerts, [
      {
        type: "danger",
        category: "Budgets",
        text: "Total spending is higher than total budget.",
      },
    ]);
  });
});
