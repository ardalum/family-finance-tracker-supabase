import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMonthlyCloseChecklist } from "./monthlyCloseChecklist.js";

function createDashboardData(overrides = {}) {
  return {
    cards: [],
    cardRows: [],
    recurringRows: [],
    transactions: [],
    budgetRows: [],
    ...overrides,
  };
}

function getItem(checklist, id) {
  return checklist.items.find((item) => item.id === id);
}

describe("monthly close checklist", () => {
  it("handles no cards safely", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05");
    const confirmBalances = getItem(checklist, "confirm-card-balances");

    assert.equal(confirmBalances.status, "complete");
    assert.equal(checklist.totalCount, 6);
  });

  it("marks card checks complete when all cards are confirmed and paid", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        cards: [{ id: "a" }, { id: "b" }],
        cardRows: [
          { balance: 0, paid: true, hasPaymentDue: false },
          { balance: 100, paid: true, hasPaymentDue: false },
        ],
      }),
      "2099-05",
    );

    assert.equal(getItem(checklist, "confirm-card-balances").status, "complete");
    assert.equal(getItem(checklist, "pay-or-confirm-cards").status, "complete");
  });

  it("marks unpaid card as needs review", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        cards: [{ id: "a" }],
        cardRows: [{ balance: 125, paid: false, hasPaymentDue: true }],
      }),
      "2099-05",
    );

    assert.equal(getItem(checklist, "pay-or-confirm-cards").status, "needs-review");
  });

  it("marks past due card as needs review", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        cards: [{ id: "a" }],
        cardRows: [{ balance: 40, paid: false, hasPaymentDue: true, daysUntilDue: -2 }],
      }),
      "2099-05",
    );

    assert.equal(getItem(checklist, "pay-or-confirm-cards").status, "needs-review");
  });

  it("marks no transactions as needs review", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({ transactions: [] }),
      "2099-05",
    );
    assert.equal(getItem(checklist, "add-review-transactions").status, "needs-review");
  });

  it("marks over-budget categories as needs review", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        budgetRows: [{ category: "Food", remaining: -1, percentUsed: 101 }],
      }),
      "2099-05",
    );

    assert.equal(getItem(checklist, "check-budget-status").status, "needs-review");
  });

  it("marks recurring due soon rows as needs review", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        recurringRows: [{ displayStatus: "Due soon" }],
      }),
      "2099-05",
    );

    assert.equal(getItem(checklist, "review-recurring-bills").status, "needs-review");
  });

  it("does not count backup recommendation against required completion", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05");
    const backupItem = getItem(checklist, "export-backup");
    const requiredItems = checklist.items.filter((item) => item.countsTowardCompletion);

    assert.equal(backupItem.status, "recommended");
    assert.equal(backupItem.countsTowardCompletion, false);
    assert.equal(checklist.totalCount, requiredItems.length);
    assert.equal(checklist.completedCount, requiredItems.filter((item) => item.isComplete).length);
  });
});
