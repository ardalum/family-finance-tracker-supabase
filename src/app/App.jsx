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
  createRecurringDashboardInsightsRefreshers,
  createRecurringSpendingDashboardInsightsRefreshers,
  createSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "./refreshDataUtils.js";
import { createDashboardAppData, createInsightsAppData } from "./appDataComposition.js";
import { createAppViewProps } from "./appViewProps.js";
import { createInitialSelectedMonths } from "./selectedMonthUtils.js";
import { useActiveView } from "./useActiveView.js";
import { useLocalAppData } from "./useLocalAppData.js";
import { listBudgetCategories } from "../features/budgets/budgetsSupabaseService.js";
import { useBudgets } from "../features/budgets/useBudgets.js";
import { useCreditCards } from "../features/creditCards/useCreditCards.js";
import { useMonthlyBalances } from "../features/creditCards/useMonthlyBalances.js";
import { useHouseholds } from "../features/households/HouseholdProvider.jsx";
import { useHouseholdProfiles } from "../features/households/useHouseholdProfiles.js";
import {
  addRecurringPaymentToSupabase,
  deleteRecurringPaymentFromSupabase,
  importLocalRecurringPayments,
  listRecurringInstances,
  listRecurringPayments,
  markRecurringPaymentPaidInSupabase,
  markRecurringPaymentUnpaidInSupabase,
  skipRecurringPaymentInSupabase,
  updateRecurringPaymentInSupabase,
} from "../features/recurring/recurringSupabaseService.js";
import { householdHasFinanceData } from "../features/setup/setupService.js";
import { listTransactions } from "../features/spending/spendingSupabaseService.js";
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
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(
    initialSelectedMonths.dashboard,
  );
  const [dashboardBudgets, setDashboardBudgets] = useState([]);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [selectedInsightsMonth, setSelectedInsightsMonth] = useState(
    initialSelectedMonths.insights,
  );
  const [insightsBudgets, setInsightsBudgets] = useState([]);
  const [insightsTransactions, setInsightsTransactions] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [recurringStatusByMonth, setRecurringStatusByMonth] = useState({});
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [recurringCategories, setRecurringCategories] = useState([]);
  const [selectedRecurringMonth, setSelectedRecurringMonth] = useState(
    initialSelectedMonths.recurring,
  );
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [recurringSaving, setRecurringSaving] = useState(false);
  const [recurringError, setRecurringError] = useState("");
  const [recurringCategoriesLoading, setRecurringCategoriesLoading] = useState(true);
  const [recurringCategoriesError, setRecurringCategoriesError] = useState("");
  const { activeView, currentPage, setActiveView } = useActiveView();
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

  const loadDashboardData = useCallback(async () => {
    if (!activeHouseholdId) {
      setDashboardBudgets([]);
      setDashboardTransactions([]);
      setDashboardLoading(false);
      return;
    }

    setDashboardLoading(true);
    setDashboardError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedDashboardMonth);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedDashboardMonth,
        supabaseCreditCards,
        budgets,
      );

      setDashboardBudgets(budgets);
      setDashboardTransactions(transactions);
    } catch (error) {
      setDashboardError(error.message || "Could not load dashboard data.");
      setDashboardBudgets([]);
      setDashboardTransactions([]);
    } finally {
      setDashboardLoading(false);
    }
  }, [activeHouseholdId, selectedDashboardMonth, supabaseCreditCards]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const loadInsightsData = useCallback(async () => {
    if (!activeHouseholdId) {
      setInsightsBudgets([]);
      setInsightsTransactions([]);
      setInsightsLoading(false);
      return;
    }

    setInsightsLoading(true);
    setInsightsError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedInsightsMonth);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedInsightsMonth,
        supabaseCreditCards,
        budgets,
      );

      setInsightsBudgets(budgets);
      setInsightsTransactions(transactions);
    } catch (error) {
      setInsightsError(error.message || "Could not load insights data.");
      setInsightsBudgets([]);
      setInsightsTransactions([]);
    } finally {
      setInsightsLoading(false);
    }
  }, [activeHouseholdId, selectedInsightsMonth, supabaseCreditCards]);

  useEffect(() => {
    loadInsightsData();
  }, [loadInsightsData]);

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

  const loadRecurringCategories = useCallback(async () => {
    if (!activeHouseholdId) {
      setRecurringCategories([]);
      setRecurringCategoriesLoading(false);
      return [];
    }

    setRecurringCategoriesLoading(true);
    setRecurringCategoriesError("");

    try {
      const categories = await listBudgetCategories(activeHouseholdId, selectedRecurringMonth);
      setRecurringCategories(categories);
      return categories;
    } catch (error) {
      setRecurringCategoriesError(error.message || "Could not load recurring categories.");
      setRecurringCategories([]);
      return [];
    } finally {
      setRecurringCategoriesLoading(false);
    }
  }, [activeHouseholdId, selectedRecurringMonth]);

  useEffect(() => {
    loadRecurringCategories();
  }, [loadRecurringCategories]);

  const loadRecurringData = useCallback(async () => {
    if (!activeHouseholdId) {
      setRecurringPayments([]);
      setRecurringStatusByMonth({});
      setRecurringTransactions([]);
      setRecurringLoading(false);
      return;
    }

    setRecurringLoading(true);
    setRecurringError("");

    try {
      const templates = await listRecurringPayments(
        activeHouseholdId,
        supabaseCreditCards,
        recurringCategories,
      );
      const statuses = await listRecurringInstances(activeHouseholdId, templates);
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedRecurringMonth,
        supabaseCreditCards,
        recurringCategories,
      );

      setRecurringPayments(templates);
      setRecurringStatusByMonth(statuses);
      setRecurringTransactions(transactions);
    } catch (error) {
      setRecurringError(error.message || "Could not load recurring payments.");
      setRecurringPayments([]);
      setRecurringStatusByMonth({});
      setRecurringTransactions([]);
    } finally {
      setRecurringLoading(false);
    }
  }, [activeHouseholdId, recurringCategories, selectedRecurringMonth, supabaseCreditCards]);

  useEffect(() => {
    loadRecurringData();
  }, [loadRecurringData]);

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

  const createSupabaseRecurringPayment = useCallback(
    async (input) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await addRecurringPaymentToSupabase(
          activeHouseholdId,
          input,
          supabaseCreditCards,
          recurringCategories,
        );
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not add recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      recurringCategories,
      supabaseCreditCards,
    ],
  );

  const updateSupabaseRecurringPayment = useCallback(
    async (templateId, input) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await updateRecurringPaymentInSupabase(
          templateId,
          input,
          supabaseCreditCards,
          recurringCategories,
        );
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not update recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      recurringCategories,
      supabaseCreditCards,
    ],
  );

  const deleteSupabaseRecurringPayment = useCallback(
    async (templateId) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        await deleteRecurringPaymentFromSupabase(templateId);
        await runRefreshSequence(
          createRecurringDashboardInsightsRefreshers({
            loadRecurringData,
            loadDashboardData,
            loadInsightsData,
          }),
        );
      } catch (error) {
        setRecurringError(error.message || "Could not delete recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [loadDashboardData, loadInsightsData, loadRecurringData],
  );

  const markSupabaseRecurringPaid = useCallback(
    async (row) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await markRecurringPaymentPaidInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          row,
          cards: supabaseCreditCards,
          categories: recurringCategories,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not mark recurring payment paid.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      recurringCategories,
      selectedRecurringMonth,
      supabaseCreditCards,
    ],
  );

  const markSupabaseRecurringUnpaid = useCallback(
    async (template) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await markRecurringPaymentUnpaidInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          template,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not mark recurring payment unpaid.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      selectedRecurringMonth,
    ],
  );

  const skipSupabaseRecurringPayment = useCallback(
    async (template) => {
      setRecurringSaving(true);
      setRecurringError("");

      try {
        const instance = await skipRecurringPaymentInSupabase({
          householdId: activeHouseholdId,
          monthKey: selectedRecurringMonth,
          template,
        });
        await runRefreshSequence(
          createRecurringSpendingDashboardInsightsRefreshers({
            loadRecurringData,
            loadSpendingTransactions,
            loadDashboardData,
            loadInsightsData,
          }),
        );
        return instance;
      } catch (error) {
        setRecurringError(error.message || "Could not skip recurring payment.");
        throw error;
      } finally {
        setRecurringSaving(false);
      }
    },
    [
      activeHouseholdId,
      loadDashboardData,
      loadInsightsData,
      loadRecurringData,
      loadSpendingTransactions,
      selectedRecurringMonth,
    ],
  );

  const importLocalRecurringToSupabase = useCallback(async () => {
    setRecurringSaving(true);
    setRecurringError("");

    try {
      const imported = await importLocalRecurringPayments(
        activeHouseholdId,
        appData.recurringPayments,
        supabaseCreditCards,
        recurringCategories,
      );
      await runRefreshSequence(
        createRecurringDashboardInsightsRefreshers({
          loadRecurringData,
          loadDashboardData,
          loadInsightsData,
        }),
      );
      return imported;
    } catch (error) {
      setRecurringError(error.message || "Could not import local recurring payments.");
      throw error;
    } finally {
      setRecurringSaving(false);
    }
  }, [
    activeHouseholdId,
    appData.recurringPayments,
    loadDashboardData,
    loadInsightsData,
    loadRecurringData,
    recurringCategories,
    supabaseCreditCards,
  ]);

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
      }),
    );
  }, [
    loadDashboardData,
    loadInsightsData,
    loadRecurringCategories,
    loadRecurringData,
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
      }),
    [
      appData,
      dashboardBudgets,
      dashboardTransactions,
      recurringPayments,
      recurringStatusByMonth,
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
        recurringPayments,
        recurringStatusByMonth,
      }),
    [
      appData,
      insightsBudgets,
      insightsTransactions,
      recurringPayments,
      recurringStatusByMonth,
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
    selectedInsightsMonth,
    insightsLoading,
    insightsError,
    setSelectedDashboardMonth,
    setSelectedBalanceMonth,
    setSelectedBudgetMonth,
    setSelectedSpendingMonth,
    setSelectedRecurringMonth,
    setSelectedInsightsMonth,
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
