import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createAppViewProps } from "./appViewProps.js";

function callback() {}

const input = {
  appData: {
    budgetsByMonth: { current: [] },
    transactions: [{ id: "local-a" }],
    recurringPayments: [{ id: "local-b" }],
  },
  dashboardAppData: { id: "dashboard" },
  insightsAppData: { id: "insights" },
  supabaseCreditCards: [{ id: "card" }],
  supabaseBudgets: [{ id: "budget" }],
  spendingTransactions: [{ id: "transaction" }],
  recurringPayments: [{ id: "recurring" }],
  selectedDashboardMonth: "current",
  selectedInsightsMonth: "current",
  setSelectedDashboardMonth: callback,
  setSelectedInsightsMonth: callback,
  refreshData: callback,
  refreshSupabaseDataAfterImport: callback,
  addDefaultProfiles: callback,
};

describe("app view props", () => {
  it("maps dashboard and insights data", () => {
    const props = createAppViewProps(input);

    assert.equal(props.dashboardProps.appData, input.dashboardAppData);
    assert.equal(props.dashboardProps.selectedMonth, input.selectedDashboardMonth);
    assert.equal(props.dashboardProps.onMonthChange, input.setSelectedDashboardMonth);
    assert.equal(props.insightsProps.appData, input.insightsAppData);
    assert.equal(props.insightsProps.selectedMonth, input.selectedInsightsMonth);
    assert.equal(props.insightsProps.onMonthChange, input.setSelectedInsightsMonth);
  });

  it("maps local app data into feature props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.budgetProps.localBudgetsByMonth, input.appData.budgetsByMonth);
    assert.equal(props.spendingProps.localTransactions, input.appData.transactions);
    assert.equal(props.recurringProps.localRecurringPayments, input.appData.recurringPayments);
  });

  it("maps callback props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.creditCardProps.onDataChange, input.refreshData);
    assert.equal(props.backupProps.onSupabaseImportComplete, input.refreshSupabaseDataAfterImport);
    assert.equal(props.householdSettingsProps.onCreateDefaultProfiles, input.addDefaultProfiles);
  });

  it("handles missing app data", () => {
    const props = createAppViewProps({});

    assert.equal(props.budgetProps.localBudgetsByMonth, undefined);
    assert.equal(props.spendingProps.localTransactions, undefined);
    assert.equal(props.recurringProps.localRecurringPayments, undefined);
  });
});
