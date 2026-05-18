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
        transactions: [{ id: "tx1" }],
        budgetRows: [{ category: "Food", remaining: 5, percentUsed: 50 }],
      }),
      "2099-05",
      { manualChecks: { reviewInsights: true } },
    );

    assert.equal(getItem(checklist, "confirm-card-balances").status, "complete");
    assert.equal(getItem(checklist, "pay-or-confirm-cards").status, "complete");
    assert.equal(getItem(checklist, "review-insights").status, "complete");
    assert.equal(checklist.canMarkReviewed, true);
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

  it("includes optional manual review cash flow item without blocking completion", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05");
    const cashFlowItem = getItem(checklist, "review-cash-flow");

    assert.equal(cashFlowItem.isManual, true);
    assert.equal(cashFlowItem.manualCheckId, "reviewCashFlow");
    assert.equal(cashFlowItem.countsTowardCompletion, false);
    assert.equal(cashFlowItem.status, "recommended");
  });

  it("includes account, debt, and net worth review items with expected navigation", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05");

    const accountItem = getItem(checklist, "review-account-balance-snapshots");
    const debtItem = getItem(checklist, "review-debt-balance-snapshots");
    const netWorthItem = getItem(checklist, "review-net-worth-summary");
    const trendsItem = getItem(checklist, "review-net-worth-trends");

    assert.equal(accountItem.view, "accounts");
    assert.equal(accountItem.target, "monthly-account-snapshots");
    assert.equal(accountItem.countsTowardCompletion, false);
    assert.equal(accountItem.isManual, true);
    assert.equal(accountItem.manualCheckId, "reviewAccountBalances");

    assert.equal(debtItem.view, "liabilities");
    assert.equal(debtItem.target, "monthly-liability-snapshots");
    assert.equal(debtItem.countsTowardCompletion, false);
    assert.equal(debtItem.isManual, true);
    assert.equal(debtItem.manualCheckId, "reviewDebtBalances");

    assert.equal(netWorthItem.view, "net-worth");
    assert.equal(netWorthItem.target, "monthly-net-worth");
    assert.equal(netWorthItem.countsTowardCompletion, false);
    assert.equal(netWorthItem.isManual, true);
    assert.equal(netWorthItem.manualCheckId, "reviewNetWorthSummary");

    assert.equal(trendsItem.view, "insights");
    assert.equal(trendsItem.countsTowardCompletion, false);
    assert.equal(trendsItem.isManual, true);
    assert.equal(trendsItem.manualCheckId, "reviewNetWorthTrends");
  });

  it("requires manual insights confirmation even when insight data exists", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        transactions: [{ id: "tx1" }],
      }),
      "2099-05",
      { manualChecks: { reviewInsights: false } },
    );

    assert.equal(getItem(checklist, "review-insights").status, "needs-review");
    assert.equal(checklist.canMarkReviewed, false);
  });

  it("marks backup as complete when manual backup check is set", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05", {
      manualChecks: { exportBackup: true },
    });

    assert.equal(getItem(checklist, "export-backup").status, "complete");
    assert.equal(getItem(checklist, "export-backup").countsTowardCompletion, false);
  });

  it("marks new monthly-close manual review items as complete from persisted checks", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05", {
      manualChecks: {
        reviewAccountBalances: true,
        reviewDebtBalances: true,
        reviewNetWorthSummary: true,
        reviewNetWorthTrends: true,
      },
    });

    assert.equal(getItem(checklist, "review-account-balance-snapshots").status, "complete");
    assert.equal(getItem(checklist, "review-debt-balance-snapshots").status, "complete");
    assert.equal(getItem(checklist, "review-net-worth-summary").status, "complete");
    assert.equal(getItem(checklist, "review-net-worth-trends").status, "complete");
  });

  it("shows no-liabilities confirmed copy when debt review is confirmed without snapshots", () => {
    const checklist = getMonthlyCloseChecklist(createDashboardData(), "2099-05", {
      manualChecks: { reviewDebtBalances: true },
    });

    const debtItem = getItem(checklist, "review-debt-balance-snapshots");
    assert.equal(debtItem.status, "complete");
    assert.equal(debtItem.description, "No liabilities confirmed for this month.");
  });

  it("missing balance/debt data does not block month review completion", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        cards: [],
        cardRows: [],
        recurringRows: [],
        transactions: [{ id: "tx1" }],
        budgetRows: [{ category: "Food", remaining: 10, percentUsed: 20 }],
      }),
      "2099-05",
      {
        manualChecks: { reviewInsights: true },
      },
    );

    assert.equal(getItem(checklist, "review-account-balance-snapshots").status, "recommended");
    assert.equal(getItem(checklist, "review-debt-balance-snapshots").status, "recommended");
    assert.equal(getItem(checklist, "review-net-worth-summary").status, "recommended");
    assert.equal(checklist.canMarkReviewed, true);
  });

  it("reflects reviewed status from persisted review row", () => {
    const checklist = getMonthlyCloseChecklist(
      createDashboardData({
        cards: [],
        transactions: [{ id: "tx1" }],
        budgetRows: [{ category: "Food", remaining: 5, percentUsed: 25 }],
      }),
      "2099-05",
      {
        status: "reviewed",
        reviewedAt: "2099-06-01T00:00:00.000Z",
        manualChecks: { reviewInsights: true },
      },
    );

    assert.equal(checklist.isReviewed, true);
    assert.equal(checklist.reviewedAt, "2099-06-01T00:00:00.000Z");
  });
});
