import { useCallback, useEffect, useMemo, useState } from "react";
import AppProviders from "./AppProviders.jsx";
import { AppSetupLoadingScreen } from "./AppStatusMessages.jsx";
import AppFirstTimeSetupScreen from "./AppFirstTimeSetupScreen.jsx";
import AppShellFrame from "./AppShellFrame.jsx";
import AppViewRenderer from "./AppViewRenderer.jsx";
import {
  getInitialSetupStatusState,
  getSetupStatusErrorMessage,
  getSkippedSetupStatusState,
  shouldSkipSetupStatusCheck,
} from "./setupStatusUtils.js";
import {
  createAllSupabaseRefreshers,
  createDashboardInsightsRefreshers,
  createSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "./refreshDataUtils.js";
import { createDashboardAppData, createInsightsAppData } from "./appDataComposition.js";
import { createAppViewProps } from "./appViewProps.js";
import { createInitialSelectedMonths } from "./selectedMonthUtils.js";
import { useActiveView } from "./useActiveView.js";
import { useLocalAppData } from "./useLocalAppData.js";
import { useBudgets } from "../features/budgets/useBudgets.js";
import { useCreditCards } from "../features/creditCards/useCreditCards.js";
import { useDashboardData } from "../features/dashboard/useDashboardData.js";
import { useMonthlyCloseReview } from "../features/dashboard/useMonthlyCloseReview.js";
import { useMonthlyBalances } from "../features/creditCards/useMonthlyBalances.js";
import { useHouseholds } from "../features/households/HouseholdProvider.jsx";
import { useHouseholdProfiles } from "../features/households/useHouseholdProfiles.js";
import { useInsightsData } from "../features/insights/useInsightsData.js";
import { useIncomeData } from "../features/income/useIncomeData.js";
import { useAccountsData } from "../features/accounts/useAccountsData.js";
import { useLiabilitiesData } from "../features/liabilities/useLiabilitiesData.js";
import { useSavingsData } from "../features/savings/useSavingsData.js";
import { useRecurringCategories } from "../features/recurring/useRecurringCategories.js";
import { useRecurringPayments } from "../features/recurring/useRecurringPayments.js";
import { householdHasFinanceData } from "../features/setup/setupService.js";
import { useSpendingCategories } from "../features/spending/useSpendingCategories.js";
import { useSpendingTransactions } from "../features/spending/useSpendingTransactions.js";
import { getAlerts, getDashboardData } from "../features/dashboard/dashboardUtils.js";

export default function App() {
  return (
    <AppProviders>
      <FinanceTrackerApp />
    </AppProviders>
  );
}

function FinanceTrackerApp() {
  const { activeHouseholdId, activeHousehold, completeActiveHouseholdSetup } = useHouseholds();
  const { appData, refreshData } = useLocalAppData();
  const initialSetupStatusState = getInitialSetupStatusState();
  const initialSelectedMonths = createInitialSelectedMonths();
  const [setupCheckLoading, setSetupCheckLoading] = useState(initialSetupStatusState.isLoading);
  const [setupCheckError, setSetupCheckError] = useState(initialSetupStatusState.error);
  const [spendingCategoriesForTransactions, setSpendingCategoriesForTransactions] = useState([]);
  const [recurringCategoriesForPayments, setRecurringCategoriesForPayments] = useState([]);
  const { activeView, currentPage, setActiveView } = useActiveView();
  const [selectedIncomeMonth, setSelectedIncomeMonth] = useState(initialSelectedMonths.income);
  const [selectedSavingsMonth, setSelectedSavingsMonth] = useState(initialSelectedMonths.savings);
  const [selectedAccountsMonth, setSelectedAccountsMonth] = useState(
    initialSelectedMonths.accounts,
  );
  const [selectedFinancialPositionMonth, setSelectedFinancialPositionMonth] = useState(
    initialSelectedMonths.financialPosition,
  );
  const [selectedCalendarMonth, setSelectedCalendarMonth] = useState(
    initialSelectedMonths.calendar,
  );
  const [selectedLiabilitiesMonth, setSelectedLiabilitiesMonth] = useState(
    initialSelectedMonths.liabilities,
  );
  const [selectedNetWorthMonth, setSelectedNetWorthMonth] = useState(
    initialSelectedMonths.netWorth,
  );
  useEffect(() => {
    let isCurrent = true;

    async function checkSetupStatus() {
      if (shouldSkipSetupStatusCheck({ activeHouseholdId, activeHousehold })) {
        const skippedState = getSkippedSetupStatusState();
        setSetupCheckLoading(skippedState.isLoading);
        setSetupCheckError(skippedState.error);
        return;
      }

      setSetupCheckLoading(true);
      setSetupCheckError("");

      try {
        const hasExistingData = await householdHasFinanceData(activeHouseholdId);
        if (hasExistingData) {
          await completeActiveHouseholdSetup();
        }
      } catch (error) {
        if (isCurrent) {
          setSetupCheckError(getSetupStatusErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setSetupCheckLoading(false);
        }
      }
    }

    checkSetupStatus();

    return () => {
      isCurrent = false;
    };
  }, [activeHousehold?.setupComplete, activeHouseholdId, completeActiveHouseholdSetup]);

  const {
    supabaseCreditCards,
    creditCardsLoading,
    creditCardsSaving,
    creditCardsError,
    loadSupabaseCreditCards,
    createSupabaseCreditCard,
    updateSupabaseCreditCard,
    deleteSupabaseCreditCard,
  } = useCreditCards({ activeHouseholdId });
  const {
    supabaseMonthlyBalances,
    selectedBalanceMonth,
    setSelectedBalanceMonth,
    monthlyBalancesLoading,
    monthlyBalancesSaving,
    monthlyBalancesError,
    loadSupabaseMonthlyBalances,
    saveSupabaseMonthlyBalance,
  } = useMonthlyBalances({
    activeHouseholdId,
    supabaseCreditCards,
    initialSelectedMonth: initialSelectedMonths.balance,
  });

  const {
    selectedDashboardMonth,
    setSelectedDashboardMonth,
    dashboardBudgets,
    dashboardTransactions,
    dashboardLoading,
    dashboardError,
    loadDashboardData,
  } = useDashboardData({
    activeHouseholdId,
    initialSelectedMonth: initialSelectedMonths.dashboard,
    supabaseCreditCards,
  });

  const {
    selectedInsightsMonth,
    setSelectedInsightsMonth,
    insightsBudgets,
    insightsTransactions,
    ytdBudgetsByMonth,
    ytdTransactionsByMonth,
    insightsLoading,
    insightsError,
    loadInsightsData,
  } = useInsightsData({
    activeHouseholdId,
    initialSelectedMonth: initialSelectedMonths.insights,
    supabaseCreditCards,
  });

  const {
    review: monthlyCloseReview,
    loading: monthlyCloseReviewLoading,
    saving: monthlyCloseReviewSaving,
    error: monthlyCloseReviewError,
    toggleManualCheck: toggleMonthlyCloseManualCheck,
    markReviewed: markMonthlyCloseReviewed,
    reopenReview: reopenMonthlyCloseReview,
  } = useMonthlyCloseReview({
    activeHouseholdId,
    selectedMonth: selectedDashboardMonth,
  });

  const {
    spendingTransactions,
    selectedSpendingMonth,
    setSelectedSpendingMonth,
    spendingLoading,
    spendingSaving,
    spendingError,
    loadSpendingTransactions,
    createSupabaseTransaction,
    updateSupabaseTransaction,
    deleteSupabaseTransaction,
    importSupabaseTransactions: importLocalSpendingToSupabase,
  } = useSpendingTransactions({
    activeHouseholdId,
    initialSelectedMonth: initialSelectedMonths.spending,
    supabaseCreditCards,
    spendingCategories: spendingCategoriesForTransactions,
    loadDashboardData,
    loadInsightsData,
  });

  const {
    spendingCategories,
    spendingCategoriesLoading,
    spendingCategoriesError,
    loadSpendingCategories,
  } = useSpendingCategories({
    activeHouseholdId,
    selectedSpendingMonth,
  });

  useEffect(() => {
    setSpendingCategoriesForTransactions(spendingCategories);
  }, [spendingCategories]);

  const {
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions,
    selectedRecurringMonth,
    setSelectedRecurringMonth,
    recurringLoading,
    recurringSaving,
    recurringError,
    loadRecurringData,
    createSupabaseRecurringPayment,
    updateSupabaseRecurringPayment,
    deleteSupabaseRecurringPayment,
    markSupabaseRecurringPaid,
    markSupabaseRecurringUnpaid,
    skipSupabaseRecurringPayment,
    importSupabaseRecurringPayments: importLocalRecurringToSupabase,
  } = useRecurringPayments({
    activeHouseholdId,
    initialSelectedMonth: initialSelectedMonths.recurring,
    supabaseCreditCards,
    recurringCategories: recurringCategoriesForPayments,
    loadSpendingTransactions,
    loadDashboardData,
    loadInsightsData,
    localRecurringPayments: appData.recurringPayments,
  });

  const {
    recurringCategories,
    recurringCategoriesLoading,
    recurringCategoriesError,
    loadRecurringCategories,
  } = useRecurringCategories({
    activeHouseholdId,
    selectedRecurringMonth,
  });

  useEffect(() => {
    setRecurringCategoriesForPayments(recurringCategories);
  }, [recurringCategories]);

  const {
    incomeSources,
    incomeEntries,
    incomeLoading,
    incomeSaving,
    incomeError,
    loadIncomeData,
    createSupabaseIncomeSource,
    updateSupabaseIncomeSource,
    deleteSupabaseIncomeSource,
    createSupabaseIncomeEntry,
    updateSupabaseIncomeEntry,
    deleteSupabaseIncomeEntry,
  } = useIncomeData({
    activeHouseholdId,
  });

  const {
    cashAccounts,
    accountBalanceSnapshots,
    accountsLoading,
    accountsSaving,
    accountsError,
    loadAccountsData,
    createSupabaseCashAccount,
    updateSupabaseCashAccount,
    deleteSupabaseCashAccount,
    createSupabaseAccountBalanceSnapshot,
    updateSupabaseAccountBalanceSnapshot,
    deleteSupabaseAccountBalanceSnapshot,
  } = useAccountsData({
    activeHouseholdId,
  });

  const {
    liabilityAccounts,
    liabilityBalanceSnapshots,
    liabilitiesLoading,
    liabilitiesSaving,
    liabilitiesError,
    loadLiabilitiesData,
    createSupabaseLiabilityAccount,
    updateSupabaseLiabilityAccount,
    deleteSupabaseLiabilityAccount,
    createSupabaseLiabilityBalanceSnapshot,
    updateSupabaseLiabilityBalanceSnapshot,
    deleteSupabaseLiabilityBalanceSnapshot,
  } = useLiabilitiesData({
    activeHouseholdId,
  });

  const {
    savingsGoals,
    savingsContributions,
    savingsLoading,
    savingsSaving,
    savingsError,
    loadSavingsData,
    createSupabaseSavingsGoal,
    updateSupabaseSavingsGoal,
    deleteSupabaseSavingsGoal,
    createSupabaseSavingsContribution,
    updateSupabaseSavingsContribution,
    deleteSupabaseSavingsContribution,
  } = useSavingsData({
    activeHouseholdId,
  });

  const {
    householdProfiles,
    householdProfilesLoading,
    householdProfilesSaving,
    householdProfilesError,
    loadHouseholdProfiles,
    createHouseholdProfile,
    saveHouseholdProfile,
    deactivateProfile,
    addDefaultProfiles,
  } = useHouseholdProfiles({
    activeHouseholdId,
    supabaseCreditCards,
    onProfilesChanged: loadSupabaseCreditCards,
  });

  const {
    supabaseBudgets,
    selectedBudgetMonth,
    setSelectedBudgetMonth,
    budgetsLoading,
    budgetsSaving,
    budgetsError,
    loadSupabaseBudgets,
    createSupabaseBudget,
    updateSupabaseBudget,
    deleteSupabaseBudget,
    addDefaultBudgetCategories: addDefaultBudgetsToSupabase,
    copyPreviousMonthBudgetCategories: copyPreviousMonthBudgetsToSupabase,
    importSupabaseBudgetCategories: importLocalBudgetsToSupabase,
  } = useBudgets({
    activeHouseholdId,
    initialSelectedMonth: initialSelectedMonths.budget,
    loadDashboardData,
    loadInsightsData,
    localBudgetsByMonth: appData.budgetsByMonth,
  });

  const refreshSupabaseDataAfterImport = useCallback(async () => {
    await runRefreshSequence(
      createAllSupabaseRefreshers({
        loadSupabaseCreditCards,
        loadSupabaseMonthlyBalances,
        loadSupabaseBudgets,
        loadSpendingCategories,
        loadSpendingTransactions,
        loadDashboardData,
        loadInsightsData,
        loadRecurringCategories,
        loadRecurringData,
        loadIncomeData,
        loadSavingsData,
        loadAccountsData,
        loadLiabilitiesData,
      }),
    );
  }, [
    loadDashboardData,
    loadInsightsData,
    loadRecurringCategories,
    loadRecurringData,
    loadIncomeData,
    loadLiabilitiesData,
    loadAccountsData,
    loadSavingsData,
    loadSpendingCategories,
    loadSpendingTransactions,
    loadSupabaseBudgets,
    loadSupabaseCreditCards,
    loadSupabaseMonthlyBalances,
  ]);

  const finishFirstTimeSetup = useCallback(async () => {
    await completeActiveHouseholdSetup();
    setActiveView("dashboard");
  }, [completeActiveHouseholdSetup, setActiveView]);

  const dashboardAppData = useMemo(
    () =>
      createDashboardAppData({
        appData,
        creditCards: supabaseCreditCards,
        monthlyBalances: supabaseMonthlyBalances,
        selectedMonth: selectedDashboardMonth,
        budgets: dashboardBudgets,
        transactions: dashboardTransactions,
        recurringPayments,
        recurringStatusByMonth,
        incomeEntries,
        savingsContributions,
        cashAccounts,
        accountBalanceSnapshots,
        liabilityAccounts,
        liabilityBalanceSnapshots,
      }),
    [
      appData,
      dashboardBudgets,
      dashboardTransactions,
      recurringPayments,
      recurringStatusByMonth,
      incomeEntries,
      savingsContributions,
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
      selectedDashboardMonth,
      supabaseCreditCards,
      supabaseMonthlyBalances,
    ],
  );
  const insightsAppData = useMemo(
    () =>
      createInsightsAppData({
        appData,
        creditCards: supabaseCreditCards,
        monthlyBalances: supabaseMonthlyBalances,
        selectedMonth: selectedInsightsMonth,
        budgets: insightsBudgets,
        transactions: insightsTransactions,
        ytdBudgetsByMonth,
        ytdTransactionsByMonth,
        recurringPayments,
        recurringStatusByMonth,
        incomeEntries,
        savingsContributions,
        cashAccounts,
        accountBalanceSnapshots,
        liabilityAccounts,
        liabilityBalanceSnapshots,
      }),
    [
      appData,
      insightsBudgets,
      insightsTransactions,
      ytdBudgetsByMonth,
      ytdTransactionsByMonth,
      recurringPayments,
      recurringStatusByMonth,
      incomeEntries,
      savingsContributions,
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
      selectedInsightsMonth,
      supabaseCreditCards,
      supabaseMonthlyBalances,
    ],
  );
  const headerAlerts = useMemo(
    () => getAlerts(getDashboardData(dashboardAppData, selectedDashboardMonth)),
    [dashboardAppData, selectedDashboardMonth],
  );
  const appViewProps = createAppViewProps({
    appData,
    dashboardAppData,
    insightsAppData,
    supabaseCreditCards,
    supabaseMonthlyBalances,
    selectedBalanceMonth,
    creditCardsLoading,
    creditCardsError,
    creditCardsSaving,
    monthlyBalancesLoading,
    monthlyBalancesSaving,
    monthlyBalancesError,
    householdProfiles,
    householdProfilesLoading,
    householdProfilesSaving,
    householdProfilesError,
    supabaseBudgets,
    selectedBudgetMonth,
    budgetsLoading,
    budgetsError,
    budgetsSaving,
    spendingCategories,
    spendingTransactions,
    selectedSpendingMonth,
    spendingLoading,
    spendingError,
    spendingSaving,
    spendingCategoriesLoading,
    spendingCategoriesError,
    recurringCategories,
    recurringPayments,
    recurringStatusByMonth,
    recurringTransactions,
    selectedRecurringMonth,
    recurringLoading,
    recurringError,
    recurringSaving,
    recurringCategoriesLoading,
    recurringCategoriesError,
    selectedDashboardMonth,
    dashboardLoading,
    dashboardError,
    monthlyCloseReview,
    monthlyCloseReviewLoading,
    monthlyCloseReviewSaving,
    monthlyCloseReviewError,
    selectedInsightsMonth,
    selectedCalendarMonth,
    selectedFinancialPositionMonth,
    selectedAccountsMonth,
    selectedLiabilitiesMonth,
    selectedNetWorthMonth,
    selectedIncomeMonth,
    selectedSavingsMonth,
    insightsLoading,
    insightsError,
    incomeSources,
    incomeEntries,
    cashAccounts,
    accountBalanceSnapshots,
    liabilityAccounts,
    liabilityBalanceSnapshots,
    accountsLoading,
    accountsError,
    accountsSaving,
    liabilitiesLoading,
    liabilitiesError,
    liabilitiesSaving,
    incomeLoading,
    incomeError,
    incomeSaving,
    savingsGoals,
    savingsContributions,
    savingsLoading,
    savingsError,
    savingsSaving,
    setSelectedDashboardMonth,
    setSelectedBalanceMonth,
    setSelectedBudgetMonth,
    setSelectedSpendingMonth,
    setSelectedRecurringMonth,
    setSelectedInsightsMonth,
    setSelectedCalendarMonth,
    setSelectedFinancialPositionMonth,
    setSelectedAccountsMonth,
    setSelectedLiabilitiesMonth,
    setSelectedNetWorthMonth,
    setSelectedIncomeMonth,
    setSelectedSavingsMonth,
    toggleMonthlyCloseManualCheck,
    markMonthlyCloseReviewed,
    reopenMonthlyCloseReview,
    createSupabaseCreditCard,
    updateSupabaseCreditCard,
    deleteSupabaseCreditCard,
    saveSupabaseMonthlyBalance,
    refreshData,
    createSupabaseBudget,
    updateSupabaseBudget,
    deleteSupabaseBudget,
    addDefaultBudgetsToSupabase,
    copyPreviousMonthBudgetsToSupabase,
    importLocalBudgetsToSupabase,
    createSupabaseTransaction,
    updateSupabaseTransaction,
    deleteSupabaseTransaction,
    importLocalSpendingToSupabase,
    createSupabaseRecurringPayment,
    updateSupabaseRecurringPayment,
    deleteSupabaseRecurringPayment,
    markSupabaseRecurringPaid,
    markSupabaseRecurringUnpaid,
    skipSupabaseRecurringPayment,
    importLocalRecurringToSupabase,
    refreshSupabaseDataAfterImport,
    createHouseholdProfile,
    saveHouseholdProfile,
    deactivateProfile,
    addDefaultProfiles,
    createSupabaseIncomeSource,
    updateSupabaseIncomeSource,
    deleteSupabaseIncomeSource,
    createSupabaseIncomeEntry,
    updateSupabaseIncomeEntry,
    deleteSupabaseIncomeEntry,
    createSupabaseCashAccount,
    updateSupabaseCashAccount,
    deleteSupabaseCashAccount,
    createSupabaseAccountBalanceSnapshot,
    updateSupabaseAccountBalanceSnapshot,
    deleteSupabaseAccountBalanceSnapshot,
    createSupabaseLiabilityAccount,
    updateSupabaseLiabilityAccount,
    deleteSupabaseLiabilityAccount,
    createSupabaseLiabilityBalanceSnapshot,
    updateSupabaseLiabilityBalanceSnapshot,
    deleteSupabaseLiabilityBalanceSnapshot,
    createSupabaseSavingsGoal,
    updateSupabaseSavingsGoal,
    deleteSupabaseSavingsGoal,
    createSupabaseSavingsContribution,
    updateSupabaseSavingsContribution,
    deleteSupabaseSavingsContribution,
  });
  if (setupCheckLoading) {
    return <AppSetupLoadingScreen />;
  }

  if (!activeHousehold?.setupComplete) {
    return (
      <AppFirstTimeSetupScreen
        householdProfiles={householdProfiles}
        householdProfilesLoading={householdProfilesLoading}
        householdProfilesSaving={householdProfilesSaving}
        onCreateProfile={createHouseholdProfile}
        onUpdateProfile={saveHouseholdProfile}
        onDeactivateProfile={deactivateProfile}
        onCreateCard={createSupabaseCreditCard}
        creditCardsSaving={creditCardsSaving}
        onAddDefaultBudgets={addDefaultBudgetsToSupabase}
        budgetsSaving={budgetsSaving}
        onFinish={finishFirstTimeSetup}
      />
    );
  }

  return (
    <AppShellFrame
      activeView={activeView}
      currentPage={currentPage}
      headerAlerts={headerAlerts}
      setupCheckError={setupCheckError}
      onViewChange={setActiveView}
    >
      <AppViewRenderer activeView={activeView} {...appViewProps} />
    </AppShellFrame>
  );
}
