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
  cashAccounts: [{ id: "cash-default" }],
  recurringStatusByMonth: { current: { recurring: "paid" } },
  recurringTransactions: [{ id: "recurring-transaction" }],
  householdProfiles: [{ id: "profile" }],
  selectedBalanceMonth: "balance-month",
  selectedBudgetMonth: "budget-month",
  selectedSpendingMonth: "spending-month",
  selectedDashboardMonth: "dashboard-month",
  selectedInsightsMonth: "insights-month",
  selectedCalendarMonth: "calendar-month",
  selectedFinancialPositionMonth: "financial-position-month",
  selectedRecurringMonth: "recurring-month",
  selectedNetWorthMonth: "net-worth-month",
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
  setSelectedCalendarMonth: callback,
  setSelectedFinancialPositionMonth: callback,
  setSelectedNetWorthMonth: callback,
  createSupabaseCreditCard: callback,
  updateSupabaseCreditCard: callback,
  deleteSupabaseCreditCard: callback,
  saveSupabaseMonthlyBalance: callback,
  refreshData: callback,
  createSupabaseBudget: callback,
  updateSupabaseBudget: callback,
  deleteSupabaseBudget: callback,
  addDefaultBudgetsToSupabase: callback,
  copyPreviousMonthBudgetsToSupabase: callback,
  importLocalBudgetsToSupabase: callback,
  createSupabaseTransaction: callback,
  updateSupabaseTransaction: callback,
  deleteSupabaseTransaction: callback,
  importLocalSpendingToSupabase: callback,
  createSupabaseRecurringPayment: callback,
  updateSupabaseRecurringPayment: callback,
  deleteSupabaseRecurringPayment: callback,
  markSupabaseRecurringPaid: callback,
  markSupabaseRecurringUnpaid: callback,
  skipSupabaseRecurringPayment: callback,
  importLocalRecurringToSupabase: callback,
  refreshSupabaseDataAfterImport: callback,
  createHouseholdProfile: callback,
  saveHouseholdProfile: callback,
  deactivateProfile: callback,
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

  it("maps insights liability-review confirmation flag", () => {
    const props = createAppViewProps({
      ...input,
      insightsLiabilityReviewConfirmed: true,
    });

    assert.equal(props.insightsProps.liabilityReviewConfirmed, true);
  });

  it("maps financial position and net worth liability-review confirmation flags", () => {
    const props = createAppViewProps({
      ...input,
      financialPositionLiabilityReviewConfirmed: true,
      netWorthLiabilityReviewConfirmed: true,
    });

    assert.equal(props.financialPositionProps.liabilityReviewConfirmed, true);
    assert.equal(props.netWorthProps.liabilityReviewConfirmed, true);
  });

  it("maps financial position props", () => {
    const props = createAppViewProps({
      ...input,
      appData: { transactions: [{ id: "tx-1" }] },
      recurringPayments: [{ id: "rec-1" }],
      recurringStatusByMonth: { "2026-05": {} },
      incomeEntries: [{ id: "inc-1" }],
      savingsContributions: [{ id: "sav-1" }],
      cashAccounts: [{ id: "cash-1" }],
      accountBalanceSnapshots: [{ id: "acc-snap-1" }],
      liabilityAccounts: [{ id: "debt-1" }],
      liabilityBalanceSnapshots: [{ id: "debt-snap-1" }],
      incomeLoading: true,
      savingsLoading: false,
      accountsLoading: false,
      liabilitiesLoading: false,
      incomeError: "",
      savingsError: "",
      accountsError: "",
      liabilitiesError: "",
    });

    assert.equal(props.financialPositionProps.selectedMonth, input.selectedFinancialPositionMonth);
    assert.equal(
      props.financialPositionProps.onMonthChange,
      input.setSelectedFinancialPositionMonth,
    );
    assert.equal(props.financialPositionProps.loading, true);
    assert.equal(props.financialPositionProps.error, "");
    assert.equal(props.financialPositionProps.transactions.length, 1);
    assert.equal(props.financialPositionProps.recurringPayments.length, 1);
    assert.equal(props.financialPositionProps.incomeEntries.length, 1);
    assert.equal(props.financialPositionProps.savingsContributions.length, 1);
    assert.equal(props.financialPositionProps.liabilityReviewConfirmed, undefined);
  });

  it("maps calendar props", () => {
    const props = createAppViewProps({
      ...input,
      supabaseCreditCards: [{ id: "card-1" }],
      supabaseMonthlyBalances: { "calendar-month": { "card-1": { balance: 50, paid: false } } },
      recurringPayments: [{ id: "rec-1" }],
      recurringStatusByMonth: { "2026-05": {} },
      incomeEntries: [{ id: "inc-1" }],
      incomeSources: [{ id: "source-1", name: "Employer" }],
      monthlyCloseReview: { monthKey: "calendar-month", status: "in_progress" },
    });

    assert.equal(props.calendarProps.selectedMonth, input.selectedCalendarMonth);
    assert.equal(props.calendarProps.onMonthChange, input.setSelectedCalendarMonth);
    assert.equal(props.calendarProps.creditCards.length, 1);
    assert.equal(props.calendarProps.monthlyBalances["card-1"].balance, 50);
    assert.equal(props.calendarProps.recurringPayments.length, 1);
    assert.equal(props.calendarProps.incomeEntries.length, 1);
    assert.equal(props.calendarProps.targetView, undefined);
  });

  it("maps credit card props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.creditCardProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.creditCardProps.recurringPayments, input.recurringPayments);
    assert.equal(props.creditCardProps.cashAccounts, input.cashAccounts);
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

  it("maps credit card mutation callbacks", () => {
    const props = createAppViewProps(input);

    assert.equal(props.creditCardProps.onCreateCard, input.createSupabaseCreditCard);
    assert.equal(props.creditCardProps.onUpdateCard, input.updateSupabaseCreditCard);
    assert.equal(props.creditCardProps.onDeleteCard, input.deleteSupabaseCreditCard);
    assert.equal(props.creditCardProps.onMonthlyBalanceChange, input.saveSupabaseMonthlyBalance);
    assert.equal(props.creditCardProps.onDataChange, input.refreshData);
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
    assert.equal(props.budgetProps.onAddDefaultBudgets, input.addDefaultBudgetsToSupabase);
    assert.equal(
      props.budgetProps.onCopyPreviousMonthBudgets,
      input.copyPreviousMonthBudgetsToSupabase,
    );
  });

  it("maps budget mutation and import callbacks", () => {
    const props = createAppViewProps(input);

    assert.equal(props.budgetProps.onCreateBudget, input.createSupabaseBudget);
    assert.equal(props.budgetProps.onUpdateBudget, input.updateSupabaseBudget);
    assert.equal(props.budgetProps.onDeleteBudget, input.deleteSupabaseBudget);
    assert.equal(props.budgetProps.onImportLocalBudgets, input.importLocalBudgetsToSupabase);
  });

  it("maps spending props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.spendingProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.spendingProps.cashAccounts, input.cashAccounts);
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

  it("maps spending mutation and import callbacks", () => {
    const props = createAppViewProps(input);

    assert.equal(props.spendingProps.onCreateTransaction, input.createSupabaseTransaction);
    assert.equal(props.spendingProps.onUpdateTransaction, input.updateSupabaseTransaction);
    assert.equal(props.spendingProps.onDeleteTransaction, input.deleteSupabaseTransaction);
    assert.equal(
      props.spendingProps.onImportLocalTransactions,
      input.importLocalSpendingToSupabase,
    );
  });

  it("maps recurring props", () => {
    const props = createAppViewProps(input);

    assert.equal(props.recurringProps.creditCards, input.supabaseCreditCards);
    assert.equal(props.recurringProps.cashAccounts, input.cashAccounts);
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

  it("maps recurring mutation and status callbacks", () => {
    const props = createAppViewProps(input);

    assert.equal(
      props.recurringProps.onCreateRecurringPayment,
      input.createSupabaseRecurringPayment,
    );
    assert.equal(
      props.recurringProps.onUpdateRecurringPayment,
      input.updateSupabaseRecurringPayment,
    );
    assert.equal(
      props.recurringProps.onDeleteRecurringPayment,
      input.deleteSupabaseRecurringPayment,
    );
    assert.equal(props.recurringProps.onMarkRecurringPaid, input.markSupabaseRecurringPaid);
    assert.equal(props.recurringProps.onMarkRecurringUnpaid, input.markSupabaseRecurringUnpaid);
    assert.equal(props.recurringProps.onSkipRecurringPayment, input.skipSupabaseRecurringPayment);
    assert.equal(
      props.recurringProps.onImportLocalRecurringPayments,
      input.importLocalRecurringToSupabase,
    );
  });

  it("maps net worth props", () => {
    const props = createAppViewProps({
      ...input,
      cashAccounts: [{ id: "cash-1" }],
      accountBalanceSnapshots: [{ id: "snap-1" }],
      liabilityAccounts: [{ id: "debt-1" }],
      liabilityBalanceSnapshots: [{ id: "debt-snap-1" }],
      accountsLoading: true,
      liabilitiesLoading: false,
      accountsError: "",
      liabilitiesError: "liability error",
    });

    assert.equal(props.netWorthProps.cashAccounts.length, 1);
    assert.equal(props.netWorthProps.liabilityAccounts.length, 1);
    assert.equal(props.netWorthProps.selectedMonth, input.selectedNetWorthMonth);
    assert.equal(props.netWorthProps.loading, true);
    assert.equal(props.netWorthProps.error, "liability error");
    assert.equal(props.netWorthProps.onMonthChange, input.setSelectedNetWorthMonth);
    assert.equal(props.netWorthProps.liabilityReviewConfirmed, undefined);
  });

  it("maps liabilities no-liability confirmation controls", () => {
    const setNoLiabilitiesConfirmed = callback;
    const props = createAppViewProps({
      ...input,
      selectedLiabilitiesMonth: "liability-month",
      setSelectedLiabilitiesMonth: callback,
      liabilitiesMonthlyCloseReview: { manualChecks: { reviewDebtBalances: true } },
      liabilitiesMonthlyCloseSaving: true,
      setNoLiabilitiesConfirmed,
    });

    assert.equal(props.liabilitiesProps.selectedMonth, "liability-month");
    assert.equal(props.liabilitiesProps.noLiabilitiesConfirmed, true);
    assert.equal(props.liabilitiesProps.noLiabilitiesSaving, true);
    assert.equal(props.liabilitiesProps.onSetNoLiabilitiesConfirmed, setNoLiabilitiesConfirmed);
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

  it("maps household settings mutation callbacks", () => {
    const props = createAppViewProps(input);

    assert.equal(props.householdSettingsProps.onCreateProfile, input.createHouseholdProfile);
    assert.equal(props.householdSettingsProps.onUpdateProfile, input.saveHouseholdProfile);
    assert.equal(props.householdSettingsProps.onDeactivateProfile, input.deactivateProfile);
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
