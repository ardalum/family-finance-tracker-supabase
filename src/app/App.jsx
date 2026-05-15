import { useCallback, useEffect, useMemo, useState } from "react";
import AppShell from "../components/layout/AppShell.jsx";
import AppProviders from "./AppProviders.jsx";
import AppHeaderAccountSlot from "./AppHeaderAccountSlot.jsx";
import { AppSetupErrorMessage, AppSetupLoadingScreen } from "./AppStatusMessages.jsx";
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
import { useActiveView } from "./useActiveView.js";
import { useLocalAppData } from "./useLocalAppData.js";
import AboutWalletFlow from "../features/about/components/AboutWalletFlow.jsx";
import BackupRestore from "../features/backup/components/BackupRestore.jsx";
import BudgetTracker from "../features/budgets/components/BudgetTracker.jsx";
import {
  addBudgetCategoryToSupabase,
  deleteBudgetCategoryFromSupabase,
  importLocalBudgetCategories,
  listBudgetCategories,
  updateBudgetCategoryInSupabase,
} from "../features/budgets/budgetsSupabaseService.js";
import { defaultBudgetCategories } from "../features/budgets/budgetDefaults.js";
import CreditCardTracker from "../features/creditCards/components/CreditCardTracker.jsx";
import {
  addCreditCardToSupabase,
  deleteCreditCardFromSupabase,
  listCreditCards,
  updateCreditCardInSupabase,
} from "../features/creditCards/creditCardsSupabaseService.js";
import {
  listAllMonthlyBalances,
  upsertMonthlyBalance,
} from "../features/creditCards/monthlyBalancesSupabaseService.js";
import Dashboard from "../features/dashboard/components/Dashboard.jsx";
import { useHouseholds } from "../features/households/HouseholdProvider.jsx";
import HouseholdSettings from "../features/households/components/HouseholdSettings.jsx";
import Insights from "../features/insights/components/Insights.jsx";
import {
  addHouseholdProfile,
  createDefaultHouseholdProfiles,
  deactivateHouseholdProfile,
  listHouseholdProfiles,
  updateHouseholdProfile,
} from "../features/households/householdProfilesService.js";
import RecurringPayments from "../features/recurring/components/RecurringPayments.jsx";
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
import FirstTimeSetupWizard from "../features/setup/components/FirstTimeSetupWizard.jsx";
import AppSettings from "../features/settings/components/AppSettings.jsx";
import { householdHasFinanceData } from "../features/setup/setupService.js";
import SpendingTracker from "../features/spending/components/SpendingTracker.jsx";
import {
  addTransactionToSupabase,
  deleteTransactionFromSupabase,
  importLocalTransactions,
  listTransactions,
  updateTransactionInSupabase,
} from "../features/spending/spendingSupabaseService.js";
import { getAlerts, getDashboardData } from "../features/dashboard/dashboardUtils.js";
import { getCurrentMonthKey } from "../lib/dates.js";

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
  const [setupCheckLoading, setSetupCheckLoading] = useState(initialSetupStatusState.isLoading);
  const [setupCheckError, setSetupCheckError] = useState(initialSetupStatusState.error);
  const [supabaseCreditCards, setSupabaseCreditCards] = useState([]);
  const [creditCardsLoading, setCreditCardsLoading] = useState(true);
  const [creditCardsSaving, setCreditCardsSaving] = useState(false);
  const [creditCardsError, setCreditCardsError] = useState("");
  const [householdProfiles, setHouseholdProfiles] = useState([]);
  const [householdProfilesLoading, setHouseholdProfilesLoading] = useState(true);
  const [householdProfilesSaving, setHouseholdProfilesSaving] = useState(false);
  const [householdProfilesError, setHouseholdProfilesError] = useState("");
  const [supabaseMonthlyBalances, setSupabaseMonthlyBalances] = useState({});
  const [selectedBalanceMonth, setSelectedBalanceMonth] = useState(getCurrentMonthKey());
  const [monthlyBalancesLoading, setMonthlyBalancesLoading] = useState(true);
  const [monthlyBalancesSaving, setMonthlyBalancesSaving] = useState(false);
  const [monthlyBalancesError, setMonthlyBalancesError] = useState("");
  const [supabaseBudgets, setSupabaseBudgets] = useState([]);
  const [selectedBudgetMonth, setSelectedBudgetMonth] = useState(getCurrentMonthKey());
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [budgetsSaving, setBudgetsSaving] = useState(false);
  const [budgetsError, setBudgetsError] = useState("");
  const [spendingTransactions, setSpendingTransactions] = useState([]);
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [selectedSpendingMonth, setSelectedSpendingMonth] = useState(getCurrentMonthKey());
  const [spendingLoading, setSpendingLoading] = useState(true);
  const [spendingSaving, setSpendingSaving] = useState(false);
  const [spendingError, setSpendingError] = useState("");
  const [spendingCategoriesLoading, setSpendingCategoriesLoading] = useState(true);
  const [spendingCategoriesError, setSpendingCategoriesError] = useState("");
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState(getCurrentMonthKey());
  const [dashboardBudgets, setDashboardBudgets] = useState([]);
  const [dashboardTransactions, setDashboardTransactions] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");
  const [selectedInsightsMonth, setSelectedInsightsMonth] = useState(getCurrentMonthKey());
  const [insightsBudgets, setInsightsBudgets] = useState([]);
  const [insightsTransactions, setInsightsTransactions] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [recurringStatusByMonth, setRecurringStatusByMonth] = useState({});
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [recurringCategories, setRecurringCategories] = useState([]);
  const [selectedRecurringMonth, setSelectedRecurringMonth] = useState(getCurrentMonthKey());
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

  const loadHouseholdProfiles = useCallback(async () => {
    if (!activeHouseholdId) {
      setHouseholdProfiles([]);
      setHouseholdProfilesLoading(false);
      return [];
    }

    setHouseholdProfilesLoading(true);
    setHouseholdProfilesError("");

    try {
      const profiles = await listHouseholdProfiles(activeHouseholdId);
      setHouseholdProfiles(profiles);
      return profiles;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not load household profiles.");
      setHouseholdProfiles([]);
      return [];
    } finally {
      setHouseholdProfilesLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadHouseholdProfiles();
  }, [loadHouseholdProfiles]);

  const loadSupabaseCreditCards = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseCreditCards([]);
      setCreditCardsLoading(false);
      return [];
    }

    setCreditCardsLoading(true);
    setCreditCardsError("");

    try {
      const cards = await listCreditCards(activeHouseholdId);
      setSupabaseCreditCards(cards);
      return cards;
    } catch (error) {
      setCreditCardsError(error.message || "Could not load credit cards.");
      setSupabaseCreditCards([]);
      return [];
    } finally {
      setCreditCardsLoading(false);
    }
  }, [activeHouseholdId]);

  useEffect(() => {
    loadSupabaseCreditCards();
  }, [loadSupabaseCreditCards]);

  const loadSupabaseMonthlyBalances = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseMonthlyBalances({});
      setMonthlyBalancesLoading(false);
      return {};
    }

    setMonthlyBalancesLoading(true);
    setMonthlyBalancesError("");

    try {
      const balances = await listAllMonthlyBalances(activeHouseholdId, supabaseCreditCards);
      setSupabaseMonthlyBalances(balances);
      return balances;
    } catch (error) {
      setMonthlyBalancesError(error.message || "Could not load monthly balances.");
      setSupabaseMonthlyBalances({});
      return {};
    } finally {
      setMonthlyBalancesLoading(false);
    }
  }, [activeHouseholdId, supabaseCreditCards]);

  useEffect(() => {
    loadSupabaseMonthlyBalances();
  }, [loadSupabaseMonthlyBalances, selectedBalanceMonth]);

  const loadSupabaseBudgets = useCallback(async () => {
    if (!activeHouseholdId) {
      setSupabaseBudgets([]);
      setBudgetsLoading(false);
      return [];
    }

    setBudgetsLoading(true);
    setBudgetsError("");

    try {
      const budgets = await listBudgetCategories(activeHouseholdId, selectedBudgetMonth);
      setSupabaseBudgets(budgets);
      return budgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not load budget categories.");
      setSupabaseBudgets([]);
      return [];
    } finally {
      setBudgetsLoading(false);
    }
  }, [activeHouseholdId, selectedBudgetMonth]);

  useEffect(() => {
    loadSupabaseBudgets();
  }, [loadSupabaseBudgets]);

  const loadSpendingCategories = useCallback(async () => {
    if (!activeHouseholdId) {
      setSpendingCategories([]);
      setSpendingCategoriesLoading(false);
      return [];
    }

    setSpendingCategoriesLoading(true);
    setSpendingCategoriesError("");

    try {
      const categories = await listBudgetCategories(activeHouseholdId, selectedSpendingMonth);
      setSpendingCategories(categories);
      return categories;
    } catch (error) {
      setSpendingCategoriesError(error.message || "Could not load spending categories.");
      setSpendingCategories([]);
      return [];
    } finally {
      setSpendingCategoriesLoading(false);
    }
  }, [activeHouseholdId, selectedSpendingMonth]);

  useEffect(() => {
    loadSpendingCategories();
  }, [loadSpendingCategories]);

  const loadSpendingTransactions = useCallback(async () => {
    if (!activeHouseholdId) {
      setSpendingTransactions([]);
      setSpendingLoading(false);
      return [];
    }

    setSpendingLoading(true);
    setSpendingError("");

    try {
      const transactions = await listTransactions(
        activeHouseholdId,
        selectedSpendingMonth,
        supabaseCreditCards,
        spendingCategories,
      );
      setSpendingTransactions(transactions);
      return transactions;
    } catch (error) {
      setSpendingError(error.message || "Could not load spending transactions.");
      setSpendingTransactions([]);
      return [];
    } finally {
      setSpendingLoading(false);
    }
  }, [activeHouseholdId, selectedSpendingMonth, spendingCategories, supabaseCreditCards]);

  useEffect(() => {
    loadSpendingTransactions();
  }, [loadSpendingTransactions]);

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

  const createSupabaseCreditCard = useCallback(async (input) => {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      const card = await addCreditCardToSupabase(activeHouseholdId, input);
      setSupabaseCreditCards((cards) => [...cards, card]);
      return card;
    } catch (error) {
      setCreditCardsError(error.message || "Could not add credit card.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }, [activeHouseholdId]);

  const createHouseholdProfile = useCallback(async (input) => {
    setHouseholdProfilesSaving(true);
    setHouseholdProfilesError("");

    try {
      const profile = await addHouseholdProfile(activeHouseholdId, input);
      setHouseholdProfiles((profiles) =>
        [...profiles, profile].sort((a, b) => a.displayName.localeCompare(b.displayName)),
      );
      return profile;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not add household profile.");
      throw error;
    } finally {
      setHouseholdProfilesSaving(false);
    }
  }, [activeHouseholdId]);

  const saveHouseholdProfile = useCallback(async (profileId, input) => {
    setHouseholdProfilesSaving(true);
    setHouseholdProfilesError("");

    try {
      const profile = await updateHouseholdProfile(profileId, input);
      setHouseholdProfiles((profiles) =>
        profiles
          .map((currentProfile) => (currentProfile.id === profile.id ? profile : currentProfile))
          .sort((a, b) => a.displayName.localeCompare(b.displayName)),
      );
      await loadSupabaseCreditCards();
      return profile;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not update household profile.");
      throw error;
    } finally {
      setHouseholdProfilesSaving(false);
    }
  }, [loadSupabaseCreditCards]);

  const deactivateProfile = useCallback(async (profileId) => {
    setHouseholdProfilesSaving(true);
    setHouseholdProfilesError("");

    try {
      const profile = await deactivateHouseholdProfile(profileId);
      setHouseholdProfiles((profiles) =>
        profiles.map((currentProfile) => (currentProfile.id === profile.id ? profile : currentProfile)),
      );
      await loadSupabaseCreditCards();
      return profile;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not deactivate household profile.");
      throw error;
    } finally {
      setHouseholdProfilesSaving(false);
    }
  }, [loadSupabaseCreditCards]);

  const addDefaultProfiles = useCallback(async () => {
    setHouseholdProfilesSaving(true);
    setHouseholdProfilesError("");

    try {
      const existingOwnerNames = [
        ...new Set(
          supabaseCreditCards
            .map((card) => card.owner?.trim())
            .filter(Boolean),
        ),
      ];
      if (existingOwnerNames.length === 0) {
        setHouseholdProfilesError("No existing card owner names were found. Add profiles manually.");
        return [];
      }
      const profiles = await createDefaultHouseholdProfiles(
        activeHouseholdId,
        householdProfiles,
        existingOwnerNames,
      );
      if (profiles.length > 0) {
        setHouseholdProfiles((currentProfiles) =>
          [...currentProfiles, ...profiles].sort((a, b) =>
            a.displayName.localeCompare(b.displayName),
          ),
        );
      }
      return profiles;
    } catch (error) {
      setHouseholdProfilesError(error.message || "Could not create default profiles.");
      throw error;
    } finally {
      setHouseholdProfilesSaving(false);
    }
  }, [activeHouseholdId, householdProfiles, supabaseCreditCards]);

  const updateSupabaseCreditCard = useCallback(async (cardId, input) => {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      const card = await updateCreditCardInSupabase(cardId, input);
      setSupabaseCreditCards((cards) =>
        cards.map((currentCard) => (currentCard.id === card.id ? card : currentCard)),
      );
      return card;
    } catch (error) {
      setCreditCardsError(error.message || "Could not update credit card.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }, []);

  const deleteSupabaseCreditCard = useCallback(async (cardId) => {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      await deleteCreditCardFromSupabase(cardId);
      setSupabaseCreditCards((cards) => cards.filter((card) => card.id !== cardId));
    } catch (error) {
      setCreditCardsError(error.message || "Could not delete credit card.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }, []);

  const saveSupabaseMonthlyBalance = useCallback(async (monthKey, cardId, entry) => {
    const card = supabaseCreditCards.find((currentCard) => currentCard.id === cardId);
    if (!card) return;

    setMonthlyBalancesError("");
    setSupabaseMonthlyBalances((balances) => ({
      ...balances,
      [monthKey]: {
        ...(balances[monthKey] ?? {}),
        [cardId]: {
          balance: Number(entry.balance ?? 0) || 0,
          paid: Boolean(entry.paid),
          updatedAt: new Date().toISOString(),
        },
      },
    }));

    setMonthlyBalancesSaving(true);

    try {
      await upsertMonthlyBalance(activeHouseholdId, monthKey, card, entry);
    } catch (error) {
      setMonthlyBalancesError(error.message || "Could not save monthly balance.");
      await loadSupabaseMonthlyBalances();
      throw error;
    } finally {
      setMonthlyBalancesSaving(false);
    }
  }, [activeHouseholdId, loadSupabaseMonthlyBalances, supabaseCreditCards]);

  const createSupabaseBudget = useCallback(async (input) => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const budget = await addBudgetCategoryToSupabase(
        activeHouseholdId,
        selectedBudgetMonth,
        input,
      );
      setSupabaseBudgets((budgets) => [...budgets, budget]);
      await runRefreshSequence(
        createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      );
      return budget;
    } catch (error) {
      setBudgetsError(error.message || "Could not add budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, selectedBudgetMonth]);

  const updateSupabaseBudget = useCallback(async (budgetId, input) => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const budget = await updateBudgetCategoryInSupabase(budgetId, input);
      setSupabaseBudgets((budgets) =>
        budgets.map((currentBudget) => (currentBudget.id === budget.id ? budget : currentBudget)),
      );
      await runRefreshSequence(
        createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      );
      return budget;
    } catch (error) {
      setBudgetsError(error.message || "Could not update budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [loadDashboardData, loadInsightsData]);

  const deleteSupabaseBudget = useCallback(async (budgetId) => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      await deleteBudgetCategoryFromSupabase(budgetId);
      setSupabaseBudgets((budgets) =>
        budgets.filter((budget) => (budget.supabaseId ?? budget.id) !== budgetId),
      );
      await runRefreshSequence(
        createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      );
    } catch (error) {
      setBudgetsError(error.message || "Could not delete budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [loadDashboardData, loadInsightsData]);

  const importLocalBudgetsToSupabase = useCallback(async () => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const importedBudgets = await importLocalBudgetCategories(
        activeHouseholdId,
        {
          [selectedBudgetMonth]: appData.budgetsByMonth?.[selectedBudgetMonth] ?? [],
        },
      );
      await runRefreshSequence([
        loadSupabaseBudgets,
        ...createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      ]);
      return importedBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not import local budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [activeHouseholdId, appData.budgetsByMonth, loadDashboardData, loadInsightsData, loadSupabaseBudgets, selectedBudgetMonth]);

  const addDefaultBudgetsToSupabase = useCallback(async () => {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const existingNames = new Set(
        supabaseBudgets.map((budget) => budget.name.trim().toLowerCase()),
      );
      const missingCategories = defaultBudgetCategories.filter(
        (name) => !existingNames.has(name.trim().toLowerCase()),
      );

      if (missingCategories.length === 0) return [];

      const createdBudgets = [];
      for (const name of missingCategories) {
        const budget = await addBudgetCategoryToSupabase(activeHouseholdId, selectedBudgetMonth, {
          name,
          monthlyAmount: 0,
          notes: "",
        });
        createdBudgets.push(budget);
      }

      setSupabaseBudgets((budgets) => [...budgets, ...createdBudgets]);
      await runRefreshSequence(
        createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      );
      return createdBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not add default budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, selectedBudgetMonth, supabaseBudgets]);

  const createSupabaseTransaction = useCallback(async (input) => {
    setSpendingSaving(true);
    setSpendingError("");

    try {
      await addTransactionToSupabase(
        activeHouseholdId,
        input,
        supabaseCreditCards,
        spendingCategories,
      );
      await runRefreshSequence(
        createSpendingDashboardInsightsRefreshers({
          loadSpendingTransactions,
          loadDashboardData,
          loadInsightsData,
        }),
      );
    } catch (error) {
      setSpendingError(error.message || "Could not add transaction.");
      throw error;
    } finally {
      setSpendingSaving(false);
    }
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, loadSpendingTransactions, spendingCategories, supabaseCreditCards]);

  const updateSupabaseTransaction = useCallback(async (transactionId, input) => {
    setSpendingSaving(true);
    setSpendingError("");

    try {
      await updateTransactionInSupabase(
        transactionId,
        input,
        supabaseCreditCards,
        spendingCategories,
      );
      await runRefreshSequence(
        createSpendingDashboardInsightsRefreshers({
          loadSpendingTransactions,
          loadDashboardData,
          loadInsightsData,
        }),
      );
    } catch (error) {
      setSpendingError(error.message || "Could not update transaction.");
      throw error;
    } finally {
      setSpendingSaving(false);
    }
  }, [loadDashboardData, loadInsightsData, loadSpendingTransactions, spendingCategories, supabaseCreditCards]);

  const deleteSupabaseTransaction = useCallback(async (transactionId) => {
    setSpendingSaving(true);
    setSpendingError("");

    try {
      await deleteTransactionFromSupabase(transactionId);
      setSpendingTransactions((transactions) =>
        transactions.filter((transaction) => (transaction.supabaseId ?? transaction.id) !== transactionId),
      );
      await runRefreshSequence(
        createDashboardInsightsRefreshers({
          loadDashboardData,
          loadInsightsData,
        }),
      );
    } catch (error) {
      setSpendingError(error.message || "Could not delete transaction.");
      throw error;
    } finally {
      setSpendingSaving(false);
    }
  }, [loadDashboardData, loadInsightsData]);

  const importLocalSpendingToSupabase = useCallback(async (localMonthTransactions) => {
    setSpendingSaving(true);
    setSpendingError("");

    try {
      const importedIds = await importLocalTransactions(
        activeHouseholdId,
        localMonthTransactions,
        supabaseCreditCards,
        spendingCategories,
      );
      await runRefreshSequence([
        loadSpendingTransactions,
        loadDashboardData,
      ]);
      return importedIds;
    } catch (error) {
      setSpendingError(error.message || "Could not import local spending transactions.");
      throw error;
    } finally {
      setSpendingSaving(false);
    }
  }, [activeHouseholdId, loadDashboardData, loadSpendingTransactions, spendingCategories, supabaseCreditCards]);

  const createSupabaseRecurringPayment = useCallback(async (input) => {
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
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, loadRecurringData, recurringCategories, supabaseCreditCards]);

  const updateSupabaseRecurringPayment = useCallback(async (templateId, input) => {
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
  }, [loadDashboardData, loadInsightsData, loadRecurringData, recurringCategories, supabaseCreditCards]);

  const deleteSupabaseRecurringPayment = useCallback(async (templateId) => {
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
  }, [loadDashboardData, loadInsightsData, loadRecurringData]);

  const markSupabaseRecurringPaid = useCallback(async (row) => {
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
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, loadRecurringData, loadSpendingTransactions, recurringCategories, selectedRecurringMonth, supabaseCreditCards]);

  const markSupabaseRecurringUnpaid = useCallback(async (template) => {
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
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, loadRecurringData, loadSpendingTransactions, selectedRecurringMonth]);

  const skipSupabaseRecurringPayment = useCallback(async (template) => {
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
  }, [activeHouseholdId, loadDashboardData, loadInsightsData, loadRecurringData, loadSpendingTransactions, selectedRecurringMonth]);

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
  }, [activeHouseholdId, appData.recurringPayments, loadDashboardData, loadInsightsData, loadRecurringData, recurringCategories, supabaseCreditCards]);

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

  if (setupCheckLoading) {
    return <AppSetupLoadingScreen />;
  }

  if (!activeHousehold?.setupComplete) {
    return (
      <FirstTimeSetupWizard
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
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      pageTitle={currentPage.title}
      pageDescription={currentPage.description}
      accountSlot={<AppHeaderAccountSlot alerts={headerAlerts} onNavigate={setActiveView} />}
    >
      <AppSetupErrorMessage error={setupCheckError} />

      {activeView === "dashboard" ? (
        <Dashboard
          appData={dashboardAppData}
          selectedMonth={selectedDashboardMonth}
          onMonthChange={setSelectedDashboardMonth}
          loading={dashboardLoading}
          error={dashboardError}
        />
      ) : null}

      {activeView === "credit-cards" ? (
        <CreditCardTracker
          creditCards={supabaseCreditCards}
          monthlyBalances={supabaseMonthlyBalances}
          selectedBalanceMonth={selectedBalanceMonth}
          loading={creditCardsLoading}
          error={creditCardsError}
          isSaving={creditCardsSaving}
          monthlyBalancesLoading={monthlyBalancesLoading}
          monthlyBalancesSaving={monthlyBalancesSaving}
          monthlyBalancesError={monthlyBalancesError}
          householdProfiles={householdProfiles}
          householdProfilesLoading={householdProfilesLoading}
          onCreateCard={createSupabaseCreditCard}
          onUpdateCard={updateSupabaseCreditCard}
          onDeleteCard={deleteSupabaseCreditCard}
          onBalanceMonthChange={setSelectedBalanceMonth}
          onMonthlyBalanceChange={saveSupabaseMonthlyBalance}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "budgets" ? (
        <BudgetTracker
          budgets={supabaseBudgets}
          localBudgetsByMonth={appData.budgetsByMonth}
          selectedMonth={selectedBudgetMonth}
          loading={budgetsLoading}
          error={budgetsError}
          isSaving={budgetsSaving}
          onMonthChange={setSelectedBudgetMonth}
          onCreateBudget={createSupabaseBudget}
          onUpdateBudget={updateSupabaseBudget}
          onDeleteBudget={deleteSupabaseBudget}
          onAddDefaultBudgets={addDefaultBudgetsToSupabase}
          onImportLocalBudgets={importLocalBudgetsToSupabase}
        />
      ) : null}

      {activeView === "spending" ? (
        <SpendingTracker
          creditCards={supabaseCreditCards}
          categories={spendingCategories}
          transactions={spendingTransactions}
          localTransactions={appData.transactions}
          selectedMonth={selectedSpendingMonth}
          loading={spendingLoading}
          error={spendingError}
          isSaving={spendingSaving}
          categoriesLoading={spendingCategoriesLoading}
          categoriesError={spendingCategoriesError}
          onMonthChange={setSelectedSpendingMonth}
          onCreateTransaction={createSupabaseTransaction}
          onUpdateTransaction={updateSupabaseTransaction}
          onDeleteTransaction={deleteSupabaseTransaction}
          onImportLocalTransactions={importLocalSpendingToSupabase}
        />
      ) : null}

      {activeView === "recurring" ? (
        <RecurringPayments
          creditCards={supabaseCreditCards}
          categories={recurringCategories}
          recurringPayments={recurringPayments}
          recurringStatusByMonth={recurringStatusByMonth}
          transactions={recurringTransactions}
          localRecurringPayments={appData.recurringPayments}
          selectedMonth={selectedRecurringMonth}
          loading={recurringLoading}
          error={recurringError}
          isSaving={recurringSaving}
          categoriesLoading={recurringCategoriesLoading}
          categoriesError={recurringCategoriesError}
          onMonthChange={setSelectedRecurringMonth}
          onCreateRecurringPayment={createSupabaseRecurringPayment}
          onUpdateRecurringPayment={updateSupabaseRecurringPayment}
          onDeleteRecurringPayment={deleteSupabaseRecurringPayment}
          onMarkRecurringPaid={markSupabaseRecurringPaid}
          onMarkRecurringUnpaid={markSupabaseRecurringUnpaid}
          onSkipRecurringPayment={skipSupabaseRecurringPayment}
          onImportLocalRecurringPayments={importLocalRecurringToSupabase}
        />
      ) : null}

      {activeView === "insights" ? (
        <Insights
          appData={insightsAppData}
          selectedMonth={selectedInsightsMonth}
          onMonthChange={setSelectedInsightsMonth}
          loading={insightsLoading}
          error={insightsError}
        />
      ) : null}

      {activeView === "backup" ? (
        <BackupRestore
          onDataChange={refreshData}
          onSupabaseImportComplete={refreshSupabaseDataAfterImport}
        />
      ) : null}

      {activeView === "household-settings" ? (
        <HouseholdSettings
          householdProfiles={householdProfiles}
          householdProfilesLoading={householdProfilesLoading}
          householdProfilesSaving={householdProfilesSaving}
          householdProfilesError={householdProfilesError}
          onCreateProfile={createHouseholdProfile}
          onUpdateProfile={saveHouseholdProfile}
          onDeactivateProfile={deactivateProfile}
          onCreateDefaultProfiles={addDefaultProfiles}
        />
      ) : null}

      {activeView === "app-settings" ? <AppSettings /> : null}

      {activeView === "about" ? <AboutWalletFlow /> : null}
    </AppShell>
  );
}
