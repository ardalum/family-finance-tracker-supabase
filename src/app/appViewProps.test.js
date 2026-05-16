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
  supabaseMonthlyBalances: { current: { card: { balance: 100 } } },
  supabaseBudgets: [{ id: "budget" }],
  spendingCategories: [{ id: "spending-category" }],
  spendingTransactions: [{ id: "transaction" }],
  recurringCategories: [{ id: "recurring-category" }],
  recurringPayments: [{ id: "recurring" }],
  recurringStatusByMonth: { current: { recurring: "paid" } },
  recurringTransactions: [{ id: "recurring-transaction" }],
  householdProfiles: [{ id: "profile" }],
  selectedBalanceMonth: "balance-month",
  selectedBudgetMonth: "budget-month",
  selectedSpendingMonth: "spending-month",
  selectedDashboardMonth: "dashboard-month",
  selectedInsightsMonth: "insights-month",
  selectedRecurringMonth: "recurring-month",
  creditCardsLoading: true,
  creditCardsError: "credit card error",
  creditCardsSaving: true,
  monthlyBalancesLoading: true,
  monthlyBalancesSaving: true,
  monthlyBalancesError: "monthly balance error",
  budgetsLoading: true,
  budgetsError: "budget error",
  budgetsSaving: true,
  spendingLoading: true,
  spendingError: "spending error",
  spendingSaving: true,
  spendingCategoriesLoading: true,
  spendingCategoriesError: "spending category error",
  recurringLoading: true,
  recurringError: "recurring error",
  recurringSaving: true,
  recurringCategoriesLoading: true,
  recurringCategoriesError: "recurring category error",
  dashboardLoading: true,
  dashboardError: "dashboard error",
  insightsLoading: true,
  insightsError: "insights error",
  householdProfilesLoading: true,
  householdProfilesSaving: true,
  householdProfilesError: "household profile error",
  setSelectedDashboardMonth: callback,
  setSelectedBalanceMonth: callback,
  setSelectedBudgetMonth: callback,
  setSelectedSpendingMonth: callback,
  setSelectedRecurringMonth: callback,
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

  it("maps dashboard and insights async state", () => {
    const props = createAppViewProps(input);

    assert.equal(props.dashboardProps.loading, input.dashboardLoading);
    assert.equal(props.dashboardProps.error, input.dashboardError);
    assert.equal(props.insightsProps.loading, input.insightsLoading);
    assert.equal(props.insightsProps.error, input.insightsError);
  });

  it("maps credit card props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.creditCardProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.creditCardProps.monthlyBalances, input.supabaseMonthlyBalances);
    assert.equal(props.creditCardProps.selectedBalanceMonth, input.selectedBalanceMonth);
    assert.equal(props.creditCardProps.loading, input.creditCardsLoading);
    assert.equal(props.creditCardProps.error, input.creditCardsError);
    assert.equal(props.creditCardProps.isSaving, input.creditCardsSaving);
    assert.equal(props.creditCardProps.monthlyBalancesLoading, input.monthlyBalancesLoading);
    assert.equal(props.creditCardProps.monthlyBalancesSaving, input.monthlyBalancesSaving);
    assert.equal(props.creditCardProps.monthlyBalancesError, input.monthlyBalancesError);
    assert.equal(props.creditCardProps.householdProfiles, input.householdProfiles);
    assert.equal(props.creditCardProps.householdProfilesLoading, input.householdProfilesLoading);
    assert.equal(props.creditCardProps.onBalanceMonthChange, input.setSelectedBalanceMonth);
  });

  it("maps budget props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.budgetProps.budgets, input.supabaseBudgets);
    assert.equal(props.budgetProps.localBudgetsByMonth, input.appData.budgetsByMonth);
    assert.equal(props.budgetProps.selectedMonth, input.selectedBudgetMonth);
    assert.equal(props.budgetProps.loading, input.budgetsLoading);
    assert.equal(props.budgetProps.error, input.budgetsError);
    assert.equal(props.budgetProps.isSaving, input.budgetsSaving);
    assert.equal(props.budgetProps.onMonthChange, input.setSelectedBudgetMonth);
  });

  it("maps spending props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.spendingProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.spendingProps.categories, input.spendingCategories);
    assert.equal(props.spendingProps.transactions, input.spendingTransactions);
    assert.equal(props.spendingProps.localTransactions, input.appData.transactions);
    assert.equal(props.spendingProps.selectedMonth, input.selectedSpendingMonth);
    assert.equal(props.spendingProps.loading, input.spendingLoading);
    assert.equal(props.spendingProps.error, input.spendingError);
    assert.equal(props.spendingProps.isSaving, input.spendingSaving);
    assert.equal(props.spendingProps.categoriesLoading, input.spendingCategoriesLoading);
    assert.equal(props.spendingProps.categoriesError, input.spendingCategoriesError);
    assert.equal(props.spendingProps.onMonthChange, input.setSelectedSpendingMonth);
  });

  it("maps recurring props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.recurringProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.recurringProps.categories, input.recurringCategories);
    assert.equal(props.recurringProps.recurringPayments, input.recurringPayments);
    assert.equal(props.recurringProps.recurringStatusByMonth, input.recurringStatusByMonth);
    assert.equal(props.recurringProps.transactions, input.recurringTransactions);
    assert.equal(props.recurringProps.localRecurringPayments, input.appData.recurringPayments);
    assert.equal(props.recurringProps.selectedMonth, input.selectedRecurringMonth);
    assert.equal(props.recurringProps.loading, input.recurringLoading);
    assert.equal(props.recurringProps.error, input.recurringError);
    assert.equal(props.recurringProps.isSaving, input.recurringSaving);
    assert.equal(props.recurringProps.categoriesLoading, input.recurringCategoriesLoading);
    assert.equal(props.recurringProps.categoriesError, input.recurringCategoriesError);
    assert.equal(props.recurringProps.onMonthChange, input.setSelectedRecurringMonth);
  });

  it("maps household settings props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.householdSettingsProps.householdProfiles, input.householdProfiles);
    assert.equal(
      props.householdSettingsProps.householdProfilesLoading,
      input.householdProfilesLoading,
    );
    assert.equal(
      props.householdSettingsProps.householdProfilesSaving,
      input.householdProfilesSaving,
    );
    assert.equal(props.householdSettingsProps.householdProfilesError, input.householdProfilesError);
    assert.equal(props.householdSettingsProps.onCreateDefaultProfiles, input.addDefaultProfiles);
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
