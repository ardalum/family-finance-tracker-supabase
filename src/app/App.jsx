import { useCallback, useEffect, useState } from "react";
import AppShell from "../components/layout/AppShell.jsx";
import { AuthProvider } from "../features/auth/AuthProvider.jsx";
import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import AuthGate from "../features/auth/components/AuthGate.jsx";
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
  importLocalCreditCards,
  listCreditCards,
  updateCreditCardInSupabase,
} from "../features/creditCards/creditCardsSupabaseService.js";
import {
  importLocalMonthlyBalances,
  listAllMonthlyBalances,
  upsertMonthlyBalance,
} from "../features/creditCards/monthlyBalancesSupabaseService.js";
import Dashboard from "../features/dashboard/components/Dashboard.jsx";
import { useHouseholds } from "../features/households/HouseholdProvider.jsx";
import HouseholdGate from "../features/households/components/HouseholdGate.jsx";
import HouseholdSettings from "../features/households/components/HouseholdSettings.jsx";
import HouseholdSwitcher from "../features/households/components/HouseholdSwitcher.jsx";
import RecurringPayments from "../features/recurring/components/RecurringPayments.jsx";
import SpendingTracker from "../features/spending/components/SpendingTracker.jsx";
import { getCurrentMonthKey } from "../lib/dates.js";
import { readAppData } from "../lib/storage/appStorage.js";

const pageContent = {
  dashboard: {
    title: "Dashboard",
    description: "Review monthly budget, spending, cards, recurring bills, and alerts.",
  },
  "credit-cards": {
    title: "Credit Card Tracker",
    description: "Manage cards, monthly balances, due dates, and statement status.",
  },
  budgets: {
    title: "Budget Tracker",
    description: "Plan monthly budget categories without spending calculations yet.",
  },
  spending: {
    title: "Spending Tracker",
    description: "Track monthly transactions, splits, and spending summaries.",
  },
  recurring: {
    title: "Recurring Payments",
    description: "Manage bill templates and generate monthly spending transactions.",
  },
  backup: {
    title: "Backup / Restore",
    description: "Export, import, or reset the local data saved in this browser.",
  },
  "household-settings": {
    title: "Household Settings",
    description: "Create households, review membership, and choose the active household.",
  },
};

const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <HouseholdGate>
          <FinanceTrackerApp />
        </HouseholdGate>
      </AuthGate>
    </AuthProvider>
  );
}

function FinanceTrackerApp() {
  const { activeHouseholdId } = useHouseholds();
  const [appData, setAppData] = useState(() => readAppData());
  const [supabaseCreditCards, setSupabaseCreditCards] = useState([]);
  const [creditCardsLoading, setCreditCardsLoading] = useState(true);
  const [creditCardsSaving, setCreditCardsSaving] = useState(false);
  const [creditCardsError, setCreditCardsError] = useState("");
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
  const [activeView, setActiveViewState] = useState(() => {
    try {
      const storedView = window.localStorage.getItem(ACTIVE_VIEW_KEY);
      return pageContent[storedView] ? storedView : "dashboard";
    } catch {
      return "dashboard";
    }
  });
  const currentPage = pageContent[activeView];

  function setActiveView(nextView) {
    setActiveViewState(nextView);
    try {
      window.localStorage.setItem(ACTIVE_VIEW_KEY, nextView);
    } catch {
      // Keeping navigation usable matters more than persisting this preference.
    }
  }

  function refreshData(nextData) {
    setAppData(nextData ?? readAppData());
  }

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

  async function createSupabaseCreditCard(input) {
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
  }

  async function updateSupabaseCreditCard(cardId, input) {
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
  }

  async function deleteSupabaseCreditCard(cardId) {
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
  }

  async function importLocalCardsToSupabase(localCards) {
    setCreditCardsSaving(true);
    setCreditCardsError("");

    try {
      const importedCards = await importLocalCreditCards(activeHouseholdId, localCards);
      await loadSupabaseCreditCards();
      return importedCards;
    } catch (error) {
      setCreditCardsError(error.message || "Could not import local credit cards.");
      throw error;
    } finally {
      setCreditCardsSaving(false);
    }
  }

  async function saveSupabaseMonthlyBalance(monthKey, cardId, entry) {
    const card = supabaseCreditCards.find((currentCard) => currentCard.id === cardId);
    if (!card) return;

    setMonthlyBalancesError("");
    setSupabaseMonthlyBalances((balances) => ({
      ...balances,
      [monthKey]: {
        ...(balances[monthKey] ?? {}),
        [cardId]: {
          balance: Number(entry.balance || 0),
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
  }

  async function importLocalBalancesToSupabase() {
    setMonthlyBalancesSaving(true);
    setMonthlyBalancesError("");

    try {
      const importedRows = await importLocalMonthlyBalances(
        activeHouseholdId,
        appData.monthlyBalances,
        supabaseCreditCards,
      );
      await loadSupabaseMonthlyBalances();
      return importedRows;
    } catch (error) {
      setMonthlyBalancesError(error.message || "Could not import local monthly balances.");
      throw error;
    } finally {
      setMonthlyBalancesSaving(false);
    }
  }

  async function createSupabaseBudget(input) {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const budget = await addBudgetCategoryToSupabase(
        activeHouseholdId,
        selectedBudgetMonth,
        input,
      );
      setSupabaseBudgets((budgets) => [...budgets, budget]);
      return budget;
    } catch (error) {
      setBudgetsError(error.message || "Could not add budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }

  async function updateSupabaseBudget(budgetId, input) {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const budget = await updateBudgetCategoryInSupabase(budgetId, input);
      setSupabaseBudgets((budgets) =>
        budgets.map((currentBudget) => (currentBudget.id === budget.id ? budget : currentBudget)),
      );
      return budget;
    } catch (error) {
      setBudgetsError(error.message || "Could not update budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }

  async function deleteSupabaseBudget(budgetId) {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      await deleteBudgetCategoryFromSupabase(budgetId);
      setSupabaseBudgets((budgets) =>
        budgets.filter((budget) => (budget.supabaseId ?? budget.id) !== budgetId),
      );
    } catch (error) {
      setBudgetsError(error.message || "Could not delete budget category.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }

  async function importLocalBudgetsToSupabase() {
    setBudgetsSaving(true);
    setBudgetsError("");

    try {
      const importedBudgets = await importLocalBudgetCategories(
        activeHouseholdId,
        {
          [selectedBudgetMonth]: appData.budgetsByMonth?.[selectedBudgetMonth] ?? [],
        },
      );
      await loadSupabaseBudgets();
      return importedBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not import local budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }

  async function addDefaultBudgetsToSupabase() {
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
      return createdBudgets;
    } catch (error) {
      setBudgetsError(error.message || "Could not add default budget categories.");
      throw error;
    } finally {
      setBudgetsSaving(false);
    }
  }

  return (
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      pageTitle={currentPage.title}
      pageDescription={currentPage.description}
      accountSlot={
        <>
          <HouseholdSwitcher />
          <AccountMenu />
        </>
      }
    >
      {activeView === "dashboard" ? <Dashboard appData={appData} /> : null}

      {activeView === "credit-cards" ? (
        <CreditCardTracker
          creditCards={supabaseCreditCards}
          localCreditCards={appData.creditCards}
          monthlyBalances={supabaseMonthlyBalances}
          localMonthlyBalances={appData.monthlyBalances}
          selectedBalanceMonth={selectedBalanceMonth}
          loading={creditCardsLoading}
          error={creditCardsError}
          isSaving={creditCardsSaving}
          monthlyBalancesLoading={monthlyBalancesLoading}
          monthlyBalancesSaving={monthlyBalancesSaving}
          monthlyBalancesError={monthlyBalancesError}
          onCreateCard={createSupabaseCreditCard}
          onUpdateCard={updateSupabaseCreditCard}
          onDeleteCard={deleteSupabaseCreditCard}
          onImportLocalCards={importLocalCardsToSupabase}
          onBalanceMonthChange={setSelectedBalanceMonth}
          onMonthlyBalanceChange={saveSupabaseMonthlyBalance}
          onImportLocalMonthlyBalances={importLocalBalancesToSupabase}
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
          creditCards={appData.creditCards}
          budgetsByMonth={appData.budgetsByMonth}
          transactions={appData.transactions}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "recurring" ? (
        <RecurringPayments
          creditCards={appData.creditCards}
          budgetsByMonth={appData.budgetsByMonth}
          recurringPayments={appData.recurringPayments}
          recurringStatusByMonth={appData.recurringStatusByMonth}
          transactions={appData.transactions}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "backup" ? <BackupRestore onDataChange={refreshData} /> : null}

      {activeView === "household-settings" ? <HouseholdSettings /> : null}
    </AppShell>
  );
}
