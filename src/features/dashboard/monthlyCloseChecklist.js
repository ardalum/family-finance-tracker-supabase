export function getMonthlyCloseChecklist(data, monthKey, review = null) {
  const activeCards = data.cards ?? [];
  const cardRows = data.cardRows ?? [];
  const recurringRows = data.recurringRows ?? [];
  const budgetRows = data.budgetRows ?? [];
  const transactions = data.transactions ?? [];
  const accountBalanceSnapshots = data.accountBalanceSnapshots ?? [];
  const liabilityBalanceSnapshots = data.liabilityBalanceSnapshots ?? [];
  const manualChecks = review?.manualChecks ?? {};

  const cardsWithBalanceEntryCount = cardRows.filter((row) => row.balance > 0 || row.paid).length;
  const cardsWithBalanceEntryComplete = cardsWithBalanceEntryCount >= activeCards.length;
  const cardsNeedingPaymentCount = cardRows.filter((row) => row.hasPaymentDue).length;
  const recurringDueSoonOrPastDueCount = recurringRows.filter((row) =>
    ["Due soon", "Due now", "Past due"].includes(row.displayStatus),
  ).length;
  const overBudgetCount = budgetRows.filter((row) => row.remaining < 0).length;
  const nearLimitCount = budgetRows.filter(
    (row) => row.remaining >= 0 && row.percentUsed >= 90,
  ).length;
  const hasTransactionData = transactions.length > 0;
  const hasInsightData = hasTransactionData || budgetRows.length > 0;
  const hasAccountSnapshotsForMonth = accountBalanceSnapshots.some(
    (snapshot) => snapshot?.monthKey === monthKey,
  );
  const hasLiabilitySnapshotsForMonth = liabilityBalanceSnapshots.some(
    (snapshot) => snapshot?.monthKey === monthKey,
  );
  const hasNetWorthSnapshotData = hasAccountSnapshotsForMonth || hasLiabilitySnapshotsForMonth;
  const insightsReviewed = Boolean(manualChecks.reviewInsights);
  const cashFlowReviewed = Boolean(manualChecks.reviewCashFlow);
  const balancesReviewed = Boolean(manualChecks.reviewAccountBalances);
  const debtsReviewed = Boolean(manualChecks.reviewDebtBalances);
  const netWorthReviewed = Boolean(manualChecks.reviewNetWorthSummary);
  const netWorthTrendsReviewed = Boolean(manualChecks.reviewNetWorthTrends);
  const backupExportChecked = Boolean(manualChecks.exportBackup);

  const items = [
    {
      id: "confirm-card-balances",
      title: "Confirm card balances",
      status: cardsWithBalanceEntryComplete ? "complete" : "needs-review",
      description: cardsWithBalanceEntryComplete
        ? "All active cards are checked for this month."
        : `${cardsWithBalanceEntryCount} of ${activeCards.length} active cards are checked.`,
      view: "credit-cards",
      target: "monthly-balances",
      countsTowardCompletion: true,
      isComplete: cardsWithBalanceEntryComplete,
    },
    {
      id: "pay-or-confirm-cards",
      title: "Pay or confirm cards",
      status: cardsNeedingPaymentCount === 0 ? "complete" : "needs-review",
      description:
        cardsNeedingPaymentCount === 0
          ? "No card statements are unpaid, due soon, or past due."
          : `${cardsNeedingPaymentCount} card statement${cardsNeedingPaymentCount === 1 ? "" : "s"} still need payment review.`,
      view: "credit-cards",
      target: "monthly-balances",
      countsTowardCompletion: true,
      isComplete: cardsNeedingPaymentCount === 0,
    },
    {
      id: "review-recurring-bills",
      title: "Review recurring bills",
      status: recurringDueSoonOrPastDueCount === 0 ? "complete" : "needs-review",
      description:
        recurringDueSoonOrPastDueCount === 0
          ? "No recurring bills are due soon or past due."
          : `${recurringDueSoonOrPastDueCount} recurring bill${recurringDueSoonOrPastDueCount === 1 ? "" : "s"} need attention.`,
      view: "recurring",
      target: "this-month",
      countsTowardCompletion: true,
      isComplete: recurringDueSoonOrPastDueCount === 0,
    },
    {
      id: "add-review-transactions",
      title: "Add or review transactions",
      status: hasTransactionData ? "complete" : "needs-review",
      description: hasTransactionData
        ? `${transactions.length} transaction${transactions.length === 1 ? "" : "s"} recorded for ${monthKey}.`
        : "No transactions recorded yet for this month.",
      view: "spending",
      target: "",
      countsTowardCompletion: true,
      isComplete: hasTransactionData,
    },
    {
      id: "check-budget-status",
      title: "Check budget status",
      status: overBudgetCount > 0 ? "needs-review" : nearLimitCount > 0 ? "warning" : "complete",
      description:
        overBudgetCount > 0
          ? `${overBudgetCount} budget categor${overBudgetCount === 1 ? "y is" : "ies are"} over limit.`
          : nearLimitCount > 0
            ? `${nearLimitCount} budget categor${nearLimitCount === 1 ? "y is" : "ies are"} near limit.`
            : "No budget categories are over limit.",
      view: "budgets",
      target: "budget-table",
      countsTowardCompletion: true,
      isComplete: overBudgetCount === 0,
    },
    {
      id: "review-insights",
      title: "Review insights",
      status: insightsReviewed ? "complete" : "needs-review",
      description: !hasInsightData
        ? "Add budget or transaction data before reviewing insights."
        : insightsReviewed
          ? "Insights review confirmed for this month."
          : "Open insights and confirm review for this month.",
      view: "insights",
      target: "",
      countsTowardCompletion: true,
      isComplete: hasInsightData && insightsReviewed,
      isManual: true,
      manualCheckId: "reviewInsights",
      disabledReason: hasInsightData ? "" : "Insights data is not ready yet.",
    },
    {
      id: "review-cash-flow",
      title: "Review cash flow",
      status: cashFlowReviewed ? "complete" : "recommended",
      description: cashFlowReviewed
        ? "Cash-flow summary review confirmed for this month."
        : "Review income, spending, savings, and recurring remaining in Dashboard cash-flow summary.",
      view: "dashboard",
      target: "",
      countsTowardCompletion: false,
      isComplete: cashFlowReviewed,
      isManual: true,
      manualCheckId: "reviewCashFlow",
    },
    {
      id: "review-account-balance-snapshots",
      title: "Review account balance snapshots",
      status: balancesReviewed ? "complete" : "recommended",
      description: hasAccountSnapshotsForMonth
        ? balancesReviewed
          ? "Account balance snapshot review confirmed for this month."
          : "Review this month's account balance snapshots. Snapshots are separate from transactions."
        : "No balance snapshots found for this month.",
      view: "accounts",
      target: "monthly-account-snapshots",
      countsTowardCompletion: false,
      isComplete: balancesReviewed,
      isManual: true,
      manualCheckId: "reviewAccountBalances",
    },
    {
      id: "review-debt-balance-snapshots",
      title: "Review debt balance snapshots",
      status: debtsReviewed ? "complete" : "recommended",
      description: hasLiabilitySnapshotsForMonth
        ? debtsReviewed
          ? "Debt snapshot review confirmed for this month."
          : "Review this month's debt snapshots. Debt snapshots are separate from credit card payment tracking."
        : debtsReviewed
          ? "No liabilities confirmed for this month."
          : "No debt snapshots found for this month.",
      view: "liabilities",
      target: "monthly-liability-snapshots",
      countsTowardCompletion: false,
      isComplete: debtsReviewed,
      isManual: true,
      manualCheckId: "reviewDebtBalances",
    },
    {
      id: "review-net-worth-summary",
      title: "Review net worth summary",
      status: netWorthReviewed ? "complete" : "recommended",
      description: hasNetWorthSnapshotData
        ? netWorthReviewed
          ? "Net worth summary review confirmed for this month."
          : "Review net worth summary computed from account and debt snapshots."
        : "Net worth review appears once account or debt snapshots exist.",
      view: "net-worth",
      target: "monthly-net-worth",
      countsTowardCompletion: false,
      isComplete: netWorthReviewed,
      isManual: true,
      manualCheckId: "reviewNetWorthSummary",
    },
    {
      id: "review-net-worth-trends",
      title: "Review net worth trends",
      status: netWorthTrendsReviewed ? "complete" : "recommended",
      description: hasNetWorthSnapshotData
        ? netWorthTrendsReviewed
          ? "Net worth trend review confirmed for this month."
          : "Review net worth trend context in Insights (missing months are shown as no data)."
        : "Add account/debt snapshots to unlock net worth trend review.",
      view: "insights",
      target: "",
      countsTowardCompletion: false,
      isComplete: netWorthTrendsReviewed,
      isManual: true,
      manualCheckId: "reviewNetWorthTrends",
    },
    {
      id: "export-backup",
      title: "Export backup reminder",
      status: backupExportChecked ? "complete" : "recommended",
      description: backupExportChecked
        ? "Backup export confirmed for this month."
        : "Export a backup after month-end checks are complete.",
      view: "backup",
      target: "",
      countsTowardCompletion: false,
      isComplete: backupExportChecked,
      isManual: true,
      manualCheckId: "exportBackup",
    },
  ];

  const requiredItems = items.filter((item) => item.countsTowardCompletion);
  const completedRequiredItems = requiredItems.filter((item) => item.isComplete);

  return {
    items,
    completedCount: completedRequiredItems.length,
    totalCount: requiredItems.length,
    canMarkReviewed: completedRequiredItems.length === requiredItems.length,
    isReviewed: review?.status === "reviewed",
    reviewedAt: review?.reviewedAt ?? null,
  };
}
